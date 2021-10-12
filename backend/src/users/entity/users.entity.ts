import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, CreateDateColumn } from 'typeorm';
// import * as bcrypt from 'bcrypt';

@Entity('users')
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 50, unique: true })
  username: string;
  
  @Column({ type: "varchar", length: 50, unique: true, nullable: true })
  forty_two_login: string;
  
  @Column({ type: "varchar", length: 255, nullable: true })
  avatar: string;
 
  @Column({ type: "varchar", length: 50, nullable: true })
  two_fa_secret: string;
  
  @Column({ default: false })
  two_fa_enabled: boolean;
  
  @Column({ type: "varchar", length: 36, nullable: true })
  refresh_token: string;
  
  @Column({nullable: true })
  expiry_date: Date;
 
  @CreateDateColumn({ type: "timestamp", default: () => "now()" })
  created_at: Date;
 
  // @BeforeInsert()
  // async hashPassword() {
  //   this.salt = await bcrypt.genSalt();
  //   this.password = await bcrypt.hash(this.password, this.salt);
  // }
}
