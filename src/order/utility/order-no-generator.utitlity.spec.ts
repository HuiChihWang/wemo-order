import { Test, TestingModule } from '@nestjs/testing';
import { OrderNoGeneratorUtility } from './order-no-generator.utility';

describe('OrderNoGeneratorUtilityTest', () => {
  let generator: OrderNoGeneratorUtility;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrderNoGeneratorUtility],
    }).compile();

    generator = module.get<OrderNoGeneratorUtility>(OrderNoGeneratorUtility);
  });

  it('should be defined', () => {
    expect(generator).toBeDefined();
  });

  it('should generate order no', () => {
    const orderNo = generator.generateOrderNo();
    expect(orderNo).toBeDefined();
  });

  it('should generate with 5 capital letters then 5 digits like RTYER87012', () => {
    const testSampleNumber = 1000;
    const orderNos = Array.from({ length: testSampleNumber }, () =>
      generator.generateOrderNo(),
    );
    const regex = /^[A-Z]{5}\d{5}$/;
    const allMatched = orderNos.every((orderNo) => regex.test(orderNo));
    expect(allMatched).toBeTruthy();
  });
});
