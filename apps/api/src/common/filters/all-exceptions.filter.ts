import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus, Logger } from '@nestjs/common';

/**
 * Бүх exception-ыг барих filter.
 * Production орчинд дотоод алдааны мессежийг нуух замаар
 * мэдээлэл алдагдахаас (information leakage) хамгаална.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    const rawMessage = exception instanceof Error ? exception.message : 'Серверийн дотоод алдаа';

    /** Production орчинд дотоод алдааны дэлгэрэнгүй мэдээллийг client руу буцаахгүй */
    const isProduction = process.env.NODE_ENV === 'production';
    const message = isProduction ? 'Серверийн дотоод алдаа' : rawMessage;

    this.logger.error(`${request.method} ${request.url} - ${status}: ${rawMessage}`, exception);

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
