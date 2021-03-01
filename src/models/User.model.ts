import { Table, Column, Model, PrimaryKey, DataType, AutoIncrement } from 'sequelize-typescript';

@Table({
    tableName: 'user',
    timestamps: false
})
export class User extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id: number;

  @Column(DataType.STRING)
  name: string;

  @Column(DataType.STRING)
  githubId: string;

  @Column(DataType.DATE)
  createdAt: Date;
}