import { Table, Column, Model, ForeignKey, PrimaryKey, DataType } from 'sequelize-typescript'
import { User } from './User.model';
import City from './City.model';
import Product from './Product.model';

@Table({
  tableName: 'inventory',
  timestamps: true
})
export default class Inventory extends Model {
  @PrimaryKey
  @Column(DataType.INTEGER)
  id: number;

  @Column({
    unique: 'productId_cityId',
    type: DataType.INTEGER
  })
  @ForeignKey(() => City)
  cityId: number;

  @Column({
    unique: 'productId_cityId',
    type: DataType.INTEGER
  })
  @ForeignKey(() => Product)
  productId: number;

  @Column(DataType.INTEGER)
  amount: number;

  @Column(DataType.INTEGER)
  @ForeignKey(() => User)
  addedBy: number;

  @Column(DataType.INTEGER)
  @ForeignKey(() => User)
  updatedBy: number;

  @Column(DataType.DATE)
  createdAt: Date;

  @Column(DataType.DATE)
  updatedAt: Date;
}