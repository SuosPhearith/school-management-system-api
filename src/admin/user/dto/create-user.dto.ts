import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Gender } from 'src/auth/enum/gender.enum';
import { Role } from 'src/global/enum/role.enum';

export class CreateUserDto {
  @IsNotEmpty()
  @MaxLength(50)
  @MinLength(3)
  @IsString()
  readonly name: string;

  @IsNotEmpty()
  @MaxLength(50)
  @MinLength(3)
  @IsEmail()
  readonly email: string;

  @IsNotEmpty()
  @MaxLength(50)
  @MinLength(6)
  readonly password: string;

  @IsNotEmpty()
  @IsEnum(Role)
  readonly role: Role;

  @IsOptional()
  @IsString()
  readonly avatar?: string;

  @IsOptional()
  @IsEnum(Gender)
  readonly gender?: Gender;
}

// model User {
//     id        String    @id @default(uuid())
//     name      String
//     email     String    @unique
//     password  String
//     role      Role      @default(student)
//     active    Boolean   @default(true)
//     avatar    String?
//     gender    Gender?
//     createdAt DateTime  @default(now())
//     updatedAt DateTime  @updatedAt
//     deletedAt DateTime?
//   }
