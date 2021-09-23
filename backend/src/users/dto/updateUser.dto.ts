import { ApiProperty } from "@nestjs/swagger";
import { CreateUserDto } from "./createUser.dto";

export class UpdateUserDto extends CreateUserDto {
	// @ApiProperty()
	readonly id: number;

	// @ApiProperty()
	// readonly name: string;

	// @ApiProperty()
	// readonly surname: string
}
