import { Test, TestingModule } from '@nestjs/testing';
import { ContentController } from '../../interface/controllers/content.controller';
import { SetContentUseCase } from '../../application/use-cases/set-content.use-case';
import { GetContentUseCase } from '../../application/use-cases/get-content.use-case';
import { UpdateContentUseCase } from '../../application/use-cases/update-content.use-case';
import { DeleteContentUseCase } from '../../application/use-cases/delete-content.use-case';
import { UploadFileUseCase } from '../../application/use-cases/upload-file.use-case';
import { ContentEntity } from '../../domain/entities/content.entity';
import { TextContentVO } from '../../domain/value-objects/text-content.vo';
import { VideoContentVO } from '../../domain/value-objects/video-content.vo';

describe('ContentController', () => {
  let controller: ContentController;
  let setContentUseCase: jest.Mocked<SetContentUseCase>;
  let getContentUseCase: jest.Mocked<GetContentUseCase>;
  let updateContentUseCase: jest.Mocked<UpdateContentUseCase>;
  let deleteContentUseCase: jest.Mocked<DeleteContentUseCase>;
  let uploadFileUseCase: jest.Mocked<UploadFileUseCase>;

  /** Тестэд ашиглах mock текст контент */
  const mockTextContent = new ContentEntity({
    id: 'content-id-1',
    lessonId: 'lesson-id-1',
    contentType: 'text',
    textContent: new TextContentVO({
      html: '<p>Test</p>',
      markdown: '# Test',
      readingTimeMinutes: 5,
    }),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  /** Тестэд ашиглах mock видео контент */
  const mockVideoContent = new ContentEntity({
    id: 'content-id-2',
    lessonId: 'lesson-id-2',
    contentType: 'video',
    videoContent: new VideoContentVO({
      videoUrl: 'https://example.com/video.mp4',
      thumbnailUrl: 'https://example.com/thumb.jpg',
      durationSeconds: 1200,
    }),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  /** Текст контентын response хэлбэр */
  const mockTextContentResponse = mockTextContent.toResponse();

  /** Видео контентын response хэлбэр */
  const mockVideoContentResponse = mockVideoContent.toResponse();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContentController],
      providers: [
        {
          provide: SetContentUseCase,
          useValue: {
            executeText: jest.fn(),
            executeVideo: jest.fn(),
          },
        },
        { provide: GetContentUseCase, useValue: { execute: jest.fn() } },
        { provide: UpdateContentUseCase, useValue: { execute: jest.fn() } },
        { provide: DeleteContentUseCase, useValue: { execute: jest.fn() } },
        { provide: UploadFileUseCase, useValue: { execute: jest.fn() } },
      ],
    }).compile();

    controller = module.get<ContentController>(ContentController);
    setContentUseCase = module.get(SetContentUseCase);
    getContentUseCase = module.get(GetContentUseCase);
    updateContentUseCase = module.get(UpdateContentUseCase);
    deleteContentUseCase = module.get(DeleteContentUseCase);
    uploadFileUseCase = module.get(UploadFileUseCase);
  });

  describe('setTextContent', () => {
    it('POST /content/text — текст контент тавих', async () => {
      setContentUseCase.executeText.mockResolvedValue(mockTextContent);

      const dto = {
        lessonId: 'lesson-id-1',
        html: '<p>Test</p>',
        markdown: '# Test',
        readingTimeMinutes: 5,
      };
      const result = await controller.setTextContent(
        'user-id-1',
        'TEACHER',
        dto,
      );

      expect(result).toEqual(mockTextContentResponse);
      expect(setContentUseCase.executeText).toHaveBeenCalledWith(
        'user-id-1',
        'TEACHER',
        dto,
      );
    });
  });

  describe('setVideoContent', () => {
    it('POST /content/video — видео контент тавих', async () => {
      setContentUseCase.executeVideo.mockResolvedValue(mockVideoContent);

      const dto = {
        lessonId: 'lesson-id-2',
        videoUrl: 'https://example.com/video.mp4',
        thumbnailUrl: 'https://example.com/thumb.jpg',
        durationSeconds: 1200,
      };
      const result = await controller.setVideoContent(
        'user-id-1',
        'TEACHER',
        dto,
      );

      expect(result).toEqual(mockVideoContentResponse);
      expect(setContentUseCase.executeVideo).toHaveBeenCalledWith(
        'user-id-1',
        'TEACHER',
        dto,
      );
    });
  });

  describe('getByLessonId', () => {
    it('GET /content/lesson/:lessonId — контент авах', async () => {
      getContentUseCase.execute.mockResolvedValue(mockTextContent);

      const result = await controller.getByLessonId(
        'lesson-id-1',
        'user-id-1',
        'TEACHER',
      );

      expect(result).toEqual(mockTextContentResponse);
      expect(getContentUseCase.execute).toHaveBeenCalledWith('lesson-id-1', {
        currentUserId: 'user-id-1',
        currentUserRole: 'TEACHER',
      });
    });
  });

  describe('updateContent', () => {
    it('PATCH /content/lesson/:lessonId — контент шинэчлэх', async () => {
      updateContentUseCase.execute.mockResolvedValue(mockTextContent);

      const dto = {
        html: '<p>Updated</p>',
        markdown: '# Updated',
      };
      const result = await controller.updateContent(
        'lesson-id-1',
        'user-id-1',
        'TEACHER',
        dto,
      );

      expect(result).toEqual(mockTextContentResponse);
      expect(updateContentUseCase.execute).toHaveBeenCalledWith(
        'lesson-id-1',
        'user-id-1',
        'TEACHER',
        dto,
      );
    });
  });

  describe('deleteContent', () => {
    it('DELETE /content/lesson/:lessonId — контент устгах', async () => {
      deleteContentUseCase.execute.mockResolvedValue(undefined);

      await controller.deleteContent('lesson-id-1', 'user-id-1', 'TEACHER');

      expect(deleteContentUseCase.execute).toHaveBeenCalledWith(
        'lesson-id-1',
        'user-id-1',
        'TEACHER',
      );
    });
  });

  describe('uploadFile', () => {
    it('POST /content/lesson/:lessonId/upload — файл upload', async () => {
      uploadFileUseCase.execute.mockResolvedValue(mockVideoContent);

      const mockFile = {
        originalname: 'test-video.mp4',
        mimetype: 'video/mp4',
        size: 1024000,
        buffer: Buffer.from('test'),
        path: '/tmp/test-video.mp4',
      } as Express.Multer.File;

      const result = await controller.uploadFile(
        'lesson-id-1',
        'user-id-1',
        'TEACHER',
        mockFile,
        'video',
      );

      expect(result).toEqual(mockVideoContentResponse);
      expect(uploadFileUseCase.execute).toHaveBeenCalledWith(
        'lesson-id-1',
        'user-id-1',
        'TEACHER',
        mockFile,
        'video',
      );
    });
  });
});
