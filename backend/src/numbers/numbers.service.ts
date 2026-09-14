import { forwardRef, Inject, Injectable } from '@nestjs/common';
import {
  CreateNumberDto,
  NUMBER_TYPE,
  NumberType,
} from './dto/create-number.dto';
import { PrismaService } from '@app/database/prisma.service';
import { Prisma, QueueStatus } from '@prisma/client';
import { NumbersGateway } from './numbers.gateway';

@Injectable()
export class NumbersService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => NumbersGateway))
    private readonly gateway: NumbersGateway,
  ) {}
  async create(createNumberDto: CreateNumberDto) {
    const { name, cpf, type } = createNumberDto;

    const newNumber = await this.prisma.$transaction(async (tx) => {
      const counter = await tx.queueCounters.update({
        where: { type },
        data: { currentNumber: { increment: 1 } },
      });

      const prefix = type === NUMBER_TYPE.NORMAL ? 'N' : 'P';

      const queueNumber = `${prefix}${counter.currentNumber
        .toString()
        .padStart(3, '0')}`;

      return tx.queueNumber.create({
        data: { name, cpf, type, queueNumber },
      });
    });

    this.gateway.emitNewPendingNumber({
      id: newNumber.id,
      name: newNumber.name,
      cpf: newNumber.cpf,
      type: newNumber.type,
      queueNumber: newNumber.queueNumber,
      createdAt: newNumber.createdAt,
    });

    return newNumber.queueNumber;
  }

  async callNextNumber(id: string) {
    const nextToCall = await this.prisma.queueNumber.findUnique({
      where: { id, status: QueueStatus.WAITING },
    });
    if (!nextToCall) {
      return {
        current: null,
        lastCalls: [],
      };
    }

    try {
      await this.prisma.queueNumber.update({
        where: { id: nextToCall.id, status: QueueStatus.WAITING },
        data: { status: QueueStatus.CALLED, calledAt: new Date() },
      });

      const [result, pending] = await Promise.all([
        (async () => {
          const data = await this.prisma.queueNumber.findMany({
            where: { status: QueueStatus.CALLED },
            orderBy: { calledAt: 'desc' },
            take: 4,
          });
          return {
            current: data[0].queueNumber ?? null,
            lastCalls: data.slice(1).map((d) => d.queueNumber),
          };
        })(),
        this.getPendingCall(),
      ]);
      this.gateway.emitNumberCalled({
        queueNumber: nextToCall.queueNumber,
        type: nextToCall.type,
      });
      this.gateway.emitQueueState({
        current: result.current,
        lastCalls: result.lastCalls,
      });
      this.gateway.emitPendingList(pending);

      return result;
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      ) {
        return this.callNextNumber(id);
      }
      throw e;
    }
  }

  async getQueueState() {
    const data = await this.prisma.queueNumber.findMany({
      where: { status: QueueStatus.CALLED },
      orderBy: { calledAt: 'desc' },
      take: 4,
    });

    return {
      current: data[0]?.queueNumber ?? null,
      lastCalls: data.slice(1).map((d) => d.queueNumber),
    };
  }

  async getPendingCall() {
    const data = await this.prisma.queueNumber.findMany({
      where: { status: QueueStatus.WAITING },
      orderBy: { calledAt: 'desc' },
      take: 4,
    });

    return data;
  }

  async resetCounter(type: NumberType) {
    const result = await this.prisma.$transaction([
      this.prisma.queueNumber.updateMany({
        where: {
          type,
          status: { in: [QueueStatus.WAITING, QueueStatus.CALLED] },
        },
        data: { status: QueueStatus.EXPIRED },
      }),
      this.prisma.queueCounters.update({
        where: { type },
        data: { currentNumber: 0 },
      }),
    ]);
    this.gateway.emitQueueState({ current: null, lastCalls: [] });

    return result;
  }
}
