import { Users } from 'src/users/entity/users.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToMany } from 'typeorm';

@Entity('games')
export class Game {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 50, nullable: true })
  gameMode	: string;
  
  @Column({ type: "int", nullable: true })
  score1: number;
  
	@Column({ type: "int", nullable: true })
  score2: number;
 
  @CreateDateColumn({ type: "timestamp", default: () => "now()" })
  startedAt: Date;

  @ManyToMany(() => Users, user => user.games)
  participants: Users[]
 
}
