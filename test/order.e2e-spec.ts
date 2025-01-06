import * as MockDate from 'mockdate';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DataSource, DeepPartial } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Order } from '../src/order/entity/order.entity';
import { OrderStatus } from '../src/order/enum/order-status.enum';
import { PaymentService } from '../src/payment/service/payment.service';
import { PaymentResult } from '../src/payment/dto/payment-result.dto';
import { CurrencyCode } from '../src/payment/enum/currency.enum';

describe('OrderController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let paymentService: PaymentService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    dataSource = app.get(DataSource);
    paymentService = app.get(PaymentService);
  });

  const setTestNow = (time: string) => {
    MockDate.set(time);
  };

  afterEach(async () => {
    jest.restoreAllMocks();
    MockDate.reset();

    const tables = await dataSource.query(`
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
    `);

    for (const table of tables) {
      await dataSource.query(`TRUNCATE TABLE "${table.tablename}" CASCADE`);
    }
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  const givenOrders = async (data: DeepPartial<Order>[]): Promise<Order[]> => {
    const orderRepo = dataSource.getRepository(Order);
    const creationPromise = data.map((order) => orderRepo.save(order));
    return Promise.all(creationPromise);
  };

  const givenPaymentResult = (result: PaymentResult) => {
    jest.spyOn(paymentService, 'pay').mockResolvedValueOnce(result);
  };

  const whenPaymentFailed = () => {
    jest
      .spyOn(paymentService, 'pay')
      .mockRejectedValueOnce(new Error('Payment failed'));
  };

  describe('createOrder', () => {
    const sendCreatingOrderApi = (data: object | null) => {
      return request(app.getHttpServer()).post('/order').send(data);
    };

    it('should return 400 when request invalid', async () => {
      const validRequests = {
        rentingHistoryId: 1,
        userId: 1,
        amount: 100,
      };

      const requestWithMissingField = [
        { ...validRequests, rentingHistoryId: undefined },
        { ...validRequests, userId: undefined },
        { ...validRequests, amount: undefined },
      ];

      const invalidRequests = [
        null,
        {},
        ...requestWithMissingField,
        { ...validRequests, rentingHistoryId: 'not integer' },
        { ...validRequests, rentingHistoryId: -1 },
        { ...validRequests, userId: 'not integer' },
        { ...validRequests, userId: -1 },
        { ...validRequests, amount: 'not integer' },
        { ...validRequests, amount: -1 },
      ];

      for (const invalidRequest of invalidRequests) {
        await sendCreatingOrderApi(invalidRequest).expect(400);
      }
    });

    it('should return 400 when order is created already', async () => {
      await givenOrders([{ rentingHistoryId: 1, userId: 1, amount: 100 }]);
      await sendCreatingOrderApi({
        rentingHistoryId: 1,
        userId: 1,
        amount: 100,
      }).expect(400);
    });

    it('should return 201 when order is created successfully', async () => {
      const now = '2021-01-01T00:00:00.000Z';
      setTestNow(now);

      await sendCreatingOrderApi({
        rentingHistoryId: 1,
        userId: 1,
        amount: 100,
      })
        .expect(201)
        .expect({
          rentingHistoryId: 1,
          userId: 1,
          amount: 100,
          status: OrderStatus.PENDING,
          createdAt: now,
        });
    });
  });

  describe('searchOrders', () => {
    const sendSearchOrdersApi = (data: object | null) => {
      return request(app.getHttpServer()).get('/order/list').query(data);
    };

    it('should return 400 when request invalid', async () => {
      const validRequests = {
        userId: 1,
        status: OrderStatus.PENDING,
      };

      const requestWithInvalidField = [
        { ...validRequests, userId: 'not integer' },
        { ...validRequests, userId: -1 },
        { ...validRequests, status: 'INVALID' },
      ];

      for (const invalidRequest of requestWithInvalidField) {
        await sendSearchOrdersApi(invalidRequest).expect(400);
      }
    });

    it('should return 200 when orders are found', async () => {
      await givenOrders([
        {
          userId: 1,
          rentingHistoryId: 1,
          status: OrderStatus.PENDING,
          amount: 50,
          createdAt: new Date('2021-01-01T00:00:00.000Z'),
        },
        {
          userId: 1,
          rentingHistoryId: 2,
          status: OrderStatus.PENDING,
          amount: 50,
          createdAt: new Date('2021-01-02T00:00:00.000Z'),
        },
        {
          userId: 2,
          rentingHistoryId: 3,
          status: OrderStatus.SUCCESS,
          amount: 50,
          createdAt: new Date('2021-01-03T00:00:00.000Z'),
        },
        {
          userId: 2,
          rentingHistoryId: 4,
          status: OrderStatus.FAILED,
          amount: 100,
          createdAt: new Date('2021-01-04T00:00:00.000Z'),
        },
      ]);

      await sendSearchOrdersApi({ userId: 1, status: OrderStatus.PENDING })
        .expect(200)
        .expect({
          total: 2,
          orders: [
            {
              rentingHistoryId: 2,
              userId: 1,
              status: OrderStatus.PENDING,
              amount: 50,
              createdAt: '2021-01-02T00:00:00.000Z',
            },
            {
              rentingHistoryId: 1,
              userId: 1,
              status: OrderStatus.PENDING,
              amount: 50,
              createdAt: '2021-01-01T00:00:00.000Z',
            },
          ],
        });

      await sendSearchOrdersApi({ userId: 2 })
        .expect(200)
        .expect({
          total: 2,
          orders: [
            {
              rentingHistoryId: 4,
              userId: 2,
              status: 'FAILED',
              amount: 100,
              createdAt: '2021-01-04T00:00:00.000Z',
            },
            {
              rentingHistoryId: 3,
              userId: 2,
              status: OrderStatus.SUCCESS,
              amount: 50,
              createdAt: '2021-01-03T00:00:00.000Z',
            },
          ],
        });

      await sendSearchOrdersApi({ userId: 3 }).expect(200).expect({
        total: 0,
        orders: [],
      });
    });
  });

  describe('payOrder', () => {
    const sendPayOrderApi = (orderId: number) => {
      return request(app.getHttpServer()).post(`/order/${orderId}/pay`);
    };

    it('should return 404 when order does not exist', async () => {
      await sendPayOrderApi(1).expect(404);
    });

    it('should return 400 when order is already paid', async () => {
      const [order] = await givenOrders([
        {
          userId: 1,
          rentingHistoryId: 1,
          status: OrderStatus.SUCCESS,
          amount: 100,
          createdAt: new Date('2021-01-01T00:00:00.000Z'),
        },
      ]);

      await sendPayOrderApi(order.id).expect(400);
    });

    it('should return 200 when order is paid successfully', async () => {
      setTestNow('2021-01-01T00:00:00.000Z');

      const [order] = await givenOrders([
        {
          userId: 1,
          rentingHistoryId: 1,
          status: OrderStatus.PENDING,
          amount: 100,
          createdAt: new Date('2021-01-01T00:00:00.000Z'),
        },
      ]);

      const id = order.id;

      givenPaymentResult({
        amount: 100,
        currency: CurrencyCode.TWD,
      });

      await sendPayOrderApi(id).expect(200).expect({
        orderNo: id.toString(),
        totalPrice: 100,
        currency: 'TWD',
        payAt: '2021-01-01T00:00:00.000Z',
        status: 'SUCCESS',
      });

      expect(paymentService.pay).toHaveBeenCalledWith({
        amount: 100,
        currency: CurrencyCode.TWD,
      });
    });

    it('should return 200 and failed payment meta when any error from payment service', async () => {
      setTestNow('2021-01-01T00:00:00.000Z');

      const [order] = await givenOrders([
        {
          userId: 1,
          rentingHistoryId: 1,
          status: OrderStatus.PENDING,
          amount: 100,
          createdAt: new Date('2021-01-01T00:00:00.000Z'),
        },
      ]);

      const id = order.id;

      whenPaymentFailed();

      await sendPayOrderApi(id).expect(200).expect({
        orderNo: id.toString(),
        totalPrice: 100,
        currency: 'TWD',
        payAt: '2021-01-01T00:00:00.000Z',
        status: 'FAILED',
      });

      expect(paymentService.pay).toHaveBeenCalledWith({
        amount: 100,
        currency: CurrencyCode.TWD,
      });
    });
  });
});
