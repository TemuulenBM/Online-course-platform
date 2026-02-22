import { Test, TestingModule } from '@nestjs/testing';
import { LiveSessionsController } from '../../interface/controllers/live-sessions.controller';
import { ScheduleLiveSessionUseCase } from '../../application/use-cases/schedule-live-session.use-case';
import { GetLiveSessionUseCase } from '../../application/use-cases/get-live-session.use-case';
import { GetLiveSessionByLessonUseCase } from '../../application/use-cases/get-live-session-by-lesson.use-case';
import { ListCourseSessionsUseCase } from '../../application/use-cases/list-course-sessions.use-case';
import { ListUpcomingSessionsUseCase } from '../../application/use-cases/list-upcoming-sessions.use-case';
import { UpdateLiveSessionUseCase } from '../../application/use-cases/update-live-session.use-case';
import { CancelLiveSessionUseCase } from '../../application/use-cases/cancel-live-session.use-case';
import { StartLiveSessionUseCase } from '../../application/use-cases/start-live-session.use-case';
import { EndLiveSessionUseCase } from '../../application/use-cases/end-live-session.use-case';
import { JoinLiveSessionUseCase } from '../../application/use-cases/join-live-session.use-case';
import { LeaveLiveSessionUseCase } from '../../application/use-cases/leave-live-session.use-case';
import { GetAttendeesUseCase } from '../../application/use-cases/get-attendees.use-case';
import { GenerateAgoraTokenUseCase } from '../../application/use-cases/generate-agora-token.use-case';
import { HandleRecordingWebhookUseCase } from '../../application/use-cases/handle-recording-webhook.use-case';
import { LiveSessionEntity } from '../../domain/entities/live-session.entity';
import { SessionAttendeeEntity } from '../../domain/entities/session-attendee.entity';

describe('LiveSessionsController', () => {
  let controller: LiveSessionsController;
  let scheduleLiveSession: jest.Mocked<ScheduleLiveSessionUseCase>;
  let getLiveSession: jest.Mocked<GetLiveSessionUseCase>;
  let getLiveSessionByLesson: jest.Mocked<GetLiveSessionByLessonUseCase>;
  let listCourseSessions: jest.Mocked<ListCourseSessionsUseCase>;
  let listUpcomingSessions: jest.Mocked<ListUpcomingSessionsUseCase>;
  let updateLiveSession: jest.Mocked<UpdateLiveSessionUseCase>;
  let cancelLiveSession: jest.Mocked<CancelLiveSessionUseCase>;
  let startLiveSession: jest.Mocked<StartLiveSessionUseCase>;
  let endLiveSession: jest.Mocked<EndLiveSessionUseCase>;
  let joinLiveSession: jest.Mocked<JoinLiveSessionUseCase>;
  let leaveLiveSession: jest.Mocked<LeaveLiveSessionUseCase>;
  let getAttendees: jest.Mocked<GetAttendeesUseCase>;
  let generateAgoraToken: jest.Mocked<GenerateAgoraTokenUseCase>;
  let handleRecordingWebhook: jest.Mocked<HandleRecordingWebhookUseCase>;

  const now = new Date();
  const user = { id: 'user-1', role: 'TEACHER' };

  const mockSession = new LiveSessionEntity({
    id: 'session-1',
    lessonId: 'lesson-1',
    instructorId: 'instructor-1',
    title: 'Тест',
    description: null,
    scheduledStart: now,
    scheduledEnd: new Date(now.getTime() + 3600000),
    actualStart: null,
    actualEnd: null,
    meetingUrl: null,
    meetingId: null,
    recordingUrl: null,
    status: 'scheduled',
    createdAt: now,
    updatedAt: now,
  });

  const mockAttendee = new SessionAttendeeEntity({
    id: 'att-1',
    liveSessionId: 'session-1',
    userId: 'user-1',
    joinedAt: now,
    leftAt: null,
    durationMinutes: 0,
    createdAt: now,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LiveSessionsController],
      providers: [
        { provide: ScheduleLiveSessionUseCase, useValue: { execute: jest.fn() } },
        { provide: GetLiveSessionUseCase, useValue: { execute: jest.fn() } },
        { provide: GetLiveSessionByLessonUseCase, useValue: { execute: jest.fn() } },
        { provide: ListCourseSessionsUseCase, useValue: { execute: jest.fn() } },
        { provide: ListUpcomingSessionsUseCase, useValue: { execute: jest.fn() } },
        { provide: UpdateLiveSessionUseCase, useValue: { execute: jest.fn() } },
        { provide: CancelLiveSessionUseCase, useValue: { execute: jest.fn() } },
        { provide: StartLiveSessionUseCase, useValue: { execute: jest.fn() } },
        { provide: EndLiveSessionUseCase, useValue: { execute: jest.fn() } },
        { provide: JoinLiveSessionUseCase, useValue: { execute: jest.fn() } },
        { provide: LeaveLiveSessionUseCase, useValue: { execute: jest.fn() } },
        { provide: GetAttendeesUseCase, useValue: { execute: jest.fn() } },
        { provide: GenerateAgoraTokenUseCase, useValue: { execute: jest.fn() } },
        { provide: HandleRecordingWebhookUseCase, useValue: { execute: jest.fn() } },
      ],
    }).compile();

    controller = module.get(LiveSessionsController);
    scheduleLiveSession = module.get(ScheduleLiveSessionUseCase);
    getLiveSession = module.get(GetLiveSessionUseCase);
    getLiveSessionByLesson = module.get(GetLiveSessionByLessonUseCase);
    listCourseSessions = module.get(ListCourseSessionsUseCase);
    listUpcomingSessions = module.get(ListUpcomingSessionsUseCase);
    updateLiveSession = module.get(UpdateLiveSessionUseCase);
    cancelLiveSession = module.get(CancelLiveSessionUseCase);
    startLiveSession = module.get(StartLiveSessionUseCase);
    endLiveSession = module.get(EndLiveSessionUseCase);
    joinLiveSession = module.get(JoinLiveSessionUseCase);
    leaveLiveSession = module.get(LeaveLiveSessionUseCase);
    getAttendees = module.get(GetAttendeesUseCase);
    generateAgoraToken = module.get(GenerateAgoraTokenUseCase);
    handleRecordingWebhook = module.get(HandleRecordingWebhookUseCase);
  });

  it('schedule — session үүсгэнэ', async () => {
    scheduleLiveSession.execute.mockResolvedValue(mockSession);
    const result = await controller.schedule(user, {} as any);
    expect(result).toEqual(mockSession.toResponse());
  });

  it('listUpcoming — upcoming sessions', async () => {
    listUpcomingSessions.execute.mockResolvedValue({
      data: [mockSession],
      total: 1,
      page: 1,
      limit: 20,
    });
    const result = await controller.listUpcoming({} as any);
    expect(result.data).toHaveLength(1);
  });

  it('listByCourse — сургалтын sessions', async () => {
    listCourseSessions.execute.mockResolvedValue({
      data: [mockSession],
      total: 1,
      page: 1,
      limit: 20,
    });
    const result = await controller.listByCourse('course-1', user, {} as any);
    expect(result.data).toHaveLength(1);
  });

  it('getByLesson — хичээлийн session', async () => {
    getLiveSessionByLesson.execute.mockResolvedValue(mockSession);
    const result = await controller.getByLesson('lesson-1');
    expect(result).toEqual(mockSession.toResponse());
  });

  it('recordingWebhook — webhook хүлээн авна', async () => {
    handleRecordingWebhook.execute.mockResolvedValue(undefined);
    const result = await controller.recordingWebhook(
      { channelName: 'ocp-live-session-1', recordingUrl: 'url' },
      'sig',
    );
    expect(result).toEqual({ received: true });
  });

  it('getById — session дэлгэрэнгүй', async () => {
    getLiveSession.execute.mockResolvedValue(mockSession);
    const result = await controller.getById('session-1');
    expect(result).toEqual(mockSession.toResponse());
  });

  it('update — session шинэчлэх', async () => {
    updateLiveSession.execute.mockResolvedValue(mockSession);
    const result = await controller.update('session-1', user, { title: 'A' });
    expect(result).toEqual(mockSession.toResponse());
  });

  it('cancel — session цуцлах', async () => {
    cancelLiveSession.execute.mockResolvedValue(mockSession);
    const result = await controller.cancel('session-1', user);
    expect(result).toEqual(mockSession.toResponse());
  });

  it('start — session эхлүүлэх', async () => {
    startLiveSession.execute.mockResolvedValue({
      session: mockSession,
      token: 'tok',
      channelName: 'ch',
    });
    const result = await controller.start('session-1', user);
    expect(result.token).toBe('tok');
    expect(result.channelName).toBe('ch');
  });

  it('end — session дуусгах', async () => {
    endLiveSession.execute.mockResolvedValue(mockSession);
    const result = await controller.end('session-1', user);
    expect(result).toEqual(mockSession.toResponse());
  });

  it('join — session-д нэгдэх', async () => {
    joinLiveSession.execute.mockResolvedValue({
      session: mockSession,
      token: 'tok',
      channelName: 'ch',
      uid: 123,
    });
    const result = await controller.join('session-1', user);
    expect(result.token).toBe('tok');
    expect(result.uid).toBe(123);
  });

  it('leave — session-аас гарах', async () => {
    leaveLiveSession.execute.mockResolvedValue({ durationMinutes: 15 });
    const result = await controller.leave('session-1', user);
    expect(result.durationMinutes).toBe(15);
  });

  it('getAttendees — оролцогчдын жагсаалт', async () => {
    getAttendees.execute.mockResolvedValue({
      data: [mockAttendee],
      total: 1,
      page: 1,
      limit: 50,
    });
    const result = await controller.getAttendees('session-1', user, {} as any);
    expect(result.data).toHaveLength(1);
  });

  it('getToken — Agora token шинэчлэх', async () => {
    generateAgoraToken.execute.mockResolvedValue({
      token: 'new-tok',
      channelName: 'ch',
      uid: 456,
      appId: 'app-id',
    });
    const result = await controller.getToken('session-1', user);
    expect(result.token).toBe('new-tok');
  });
});
