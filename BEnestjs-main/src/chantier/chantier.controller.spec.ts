import { Test, TestingModule } from '@nestjs/testing';
import { ChantierController } from './chantier.controller';
import { ChantierService } from './chantier.service';

describe('ChantierController', () => {
  let controller: ChantierController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChantierController],
      providers: [ChantierService],
    }).compile();

    controller = module.get<ChantierController>(ChantierController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
