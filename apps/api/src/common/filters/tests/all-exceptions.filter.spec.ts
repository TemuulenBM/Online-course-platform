import { AllExceptionsFilter } from '../all-exceptions.filter';
import { ArgumentsHost, HttpStatus } from '@nestjs/common';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let mockResponse: any;
  let mockRequest: any;
  let mockHost: ArgumentsHost;
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    filter = new AllExceptionsFilter();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockRequest = { method: 'GET', url: '/test' };
    mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as any;
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('development орчинд алдааны мессежийг буцаана', () => {
    process.env.NODE_ENV = 'development';
    const error = new Error('DB connection хаалттай');

    filter.catch(error, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'DB connection хаалттай' }),
    );
  });

  it('production орчинд generic мессеж буцаана — дотоод мэдээлэл алдагдахгүй', () => {
    process.env.NODE_ENV = 'production';
    const error = new Error('ECONNREFUSED: PostgreSQL 5432 port');

    filter.catch(error, mockHost);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Серверийн дотоод алдаа' }),
    );
    /** Дотоод мессеж client response-д байхгүй */
    const responseBody = mockResponse.json.mock.calls[0][0];
    expect(responseBody.message).not.toContain('ECONNREFUSED');
  });

  it('Error биш exception-д default мессеж буцаана', () => {
    process.env.NODE_ENV = 'development';

    filter.catch('string error', mockHost);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Серверийн дотоод алдаа' }),
    );
  });

  it('status code 500 буцаана', () => {
    filter.catch(new Error('test'), mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
  });
});
