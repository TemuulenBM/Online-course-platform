import { Test, TestingModule } from '@nestjs/testing';
import { SystemSettingsController } from '../../interface/controllers/system-settings.controller';
import { ListSettingsUseCase } from '../../application/use-cases/list-settings.use-case';
import { GetSettingUseCase } from '../../application/use-cases/get-setting.use-case';
import { UpsertSettingUseCase } from '../../application/use-cases/upsert-setting.use-case';
import { DeleteSettingUseCase } from '../../application/use-cases/delete-setting.use-case';

describe('SystemSettingsController', () => {
  let controller: SystemSettingsController;
  let listUseCase: jest.Mocked<ListSettingsUseCase>;
  let getUseCase: jest.Mocked<GetSettingUseCase>;
  let upsertUseCase: jest.Mocked<UpsertSettingUseCase>;
  let deleteUseCase: jest.Mocked<DeleteSettingUseCase>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SystemSettingsController],
      providers: [
        { provide: ListSettingsUseCase, useValue: { execute: jest.fn() } },
        { provide: GetSettingUseCase, useValue: { execute: jest.fn() } },
        { provide: UpsertSettingUseCase, useValue: { execute: jest.fn() } },
        { provide: DeleteSettingUseCase, useValue: { execute: jest.fn() } },
      ],
    }).compile();

    controller = module.get<SystemSettingsController>(SystemSettingsController);
    listUseCase = module.get(ListSettingsUseCase);
    getUseCase = module.get(GetSettingUseCase);
    upsertUseCase = module.get(UpsertSettingUseCase);
    deleteUseCase = module.get(DeleteSettingUseCase);
  });

  it('list — тохиргоо жагсаалт', async () => {
    listUseCase.execute.mockResolvedValue([]);

    const result = await controller.list({});

    expect(result).toEqual([]);
  });

  it('listPublic — public тохиргоо', async () => {
    listUseCase.execute.mockResolvedValue([]);

    const result = await controller.listPublic();

    expect(result).toEqual([]);
    expect(listUseCase.execute).toHaveBeenCalledWith({ publicOnly: true });
  });

  it('getByKey — key-аар', async () => {
    const mockSetting = { key: 'site.name', value: 'Test' };
    getUseCase.execute.mockResolvedValue(mockSetting);

    const result = await controller.getByKey('site.name');

    expect(result).toEqual(mockSetting);
  });

  it('upsert — тохиргоо upsert', async () => {
    const mockResult = { key: 'site.name', value: 'New' };
    upsertUseCase.execute.mockResolvedValue(mockResult as any);

    const result = await controller.upsert('site.name', { value: 'New' }, 'admin-1');

    expect(result).toEqual(mockResult);
  });

  it('delete — тохиргоо устгах', async () => {
    deleteUseCase.execute.mockResolvedValue(undefined);

    const result = await controller.delete('old.key', 'admin-1');

    expect(result).toEqual({ message: 'Тохиргоо амжилттай устгагдлаа' });
  });
});
