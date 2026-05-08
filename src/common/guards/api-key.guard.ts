import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface HeaderRequest {
  header(name: string): string | undefined;
}

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<HeaderRequest>();
    const configuredKey = this.config.get<string>('API_KEY');

    if (!configuredKey || request.header('x-api-key') === configuredKey) {
      return true;
    }

    throw new UnauthorizedException('Invalid API key');
  }
}
