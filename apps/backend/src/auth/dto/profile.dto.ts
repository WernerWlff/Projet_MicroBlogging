import { IsOptional, IsString } from 'class-validator';

export class ProfileDto {
    @IsOptional()
    @IsString()
    userId?: string;
}

