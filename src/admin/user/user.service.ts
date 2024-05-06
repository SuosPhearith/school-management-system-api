import {
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResponseCreateOrUpdateDTO } from 'src/global/dto/response.create.update.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createUserDto: CreateUserDto): Promise<any> {
    try {
      //::==>>hash password
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      //::==>>apply hash password
      const savedUser = { ...createUserDto, password: hashedPassword };
      // return savedUser;
      const newUser = await this.prisma.user.create({
        data: savedUser,
      });
      //::==>>remove field password
      newUser.password = undefined;
      //::==>>response back
      const response: ResponseCreateOrUpdateDTO = {
        data: newUser,
        message: 'Created successfully',
        statusCode: HttpStatus.CREATED,
      };
      return response;
    } catch (error) {
      //::==>>check if duplicate
      if (error.code === 'P2002')
        throw new ConflictException('Email already exists');
      throw error;
    }
  }

  async findAll(page: number = 1, pageSize: number = 10): Promise<any> {
    try {
      //::==>> get all with pagination
      const skip = (page - 1) * pageSize;

      const totalCount = await this.prisma.user.count({
        where: { deletedAt: null },
      });

      const totalPages = Math.ceil(totalCount / pageSize);

      const data = await this.prisma.user.findMany({
        where: { deletedAt: null },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          active: true,
          avatar: true,
          gender: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
        },
        skip,
        take: pageSize,
      });
      //::==>>response back
      return {
        data,
        totalCount,
        totalPages,
        currentPage: page,
        pageSize,
      };
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string): Promise<any> {
    try {
      //::==>> find user by id
      const user = await this.prisma.user.findUnique({
        where: { id, deletedAt: null },
      });
      //::==>> validate if user not found
      if (!user) throw new NotFoundException(`User with id: ${id} not found`);
      //::==>> check account is valid
      if (!user.active) return { message: 'Account was ban!' };
      //::==>> remove password field
      delete user.password;
      //::==>> response back
      return user;
    } catch (error) {
      throw error;
    }
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<ResponseCreateOrUpdateDTO> {
    try {
      //::==>> find user by id
      const user = await this.findOne(id);
      //::==>> start update
      const updateUser = await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: updateUserDto,
      });
      delete updateUser.password;
      //::==>>response back
      return {
        data: updateUser,
        message: 'Updated successfully',
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      //::==>>check if duplicate
      if (error.code === 'P2002')
        throw new ConflictException('Name already exists');
      throw error;
    }
  }

  async remove(id: string): Promise<any> {
    try {
      //::==>> check is valid id
      const user = await this.findOne(id);
      //::==>> check is not super admin
      if (user.role === 'admin' && user.email === process.env.SUPER_ADMIN_EMAIL)
        throw new UnauthorizedException('Can not delete super admin');
      //::==>> delete account
      await this.prisma.user.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
      //::==>>response back
      return {
        message: 'Deleted successfully',
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      throw error;
    }
  }
}
