import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from 'src/auth/jwt.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      //::==>>get header
      const request = context.switchToHttp().getRequest();
      const authorizationHeader = request.headers['authorization'];
      if (!authorizationHeader) return false;
      //::==>>get token
      const token = authorizationHeader.split(' ')[1];
      if (!token) return false;
      //::==>>check token
      const decodedToken: any = await this.jwtService.verify(token);
      const userId = decodedToken.id;
      //::==>> Fetch the user from the database
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      //::==>> Check if the user exists
      if (!user) throw new UnauthorizedException('User not found');
      //::==>>check account is valid
      if (user.deletedAt) return false;
      if (!user.active) return false;
      //::==>>remove field password
      delete user.password;
      request.user = user;
      return true;
    } catch (error) {
      return false;
    }
  }
}
