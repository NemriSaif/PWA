import { Test, TestingModule } from '@nestjs/testing';
import { ChantierService } from './chantier.service';

describe('ChantierService', () => {
  let service: ChantierService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChantierService],
    }).compile();

    service = module.get<ChantierService>(ChantierService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
