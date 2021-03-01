import { Table, Column, Model, ForeignKey, PrimaryKey, HasMany, DataType } from 'sequelize-typescript'
import { User } from './User.model';
import Vendor from './Vendor.model';
import PublishedScope from './PublishedScope.model';
import ProductImage from './ProductImage.model';
import ProductType from './ProductType.model';
import ProductTagMapping from './ProductTagMapping.model';

@Table({
  tableName: 'product',
  timestamps: true
})
export default class Product extends Model {
  @PrimaryKey
  @Column(DataType.INTEGER)
  id: number;

  @Column({
    type: DataType.STRING,
    unique: true
  })
  key: string;

  @Column(DataType.STRING)
  title: string;

  @Column(DataType.STRING)
  html: string;

  @Column(DataType.INTEGER)
  @ForeignKey(() => Vendor)
  vendorId: number;

  @Column(DataType.INTEGER)
  @ForeignKey(() => PublishedScope)
  scopeId: number;

  @Column(DataType.INTEGER)
  @ForeignKey(() => ProductImage)
  imageId: number;

  @Column(DataType.INTEGER)
  @ForeignKey(() => ProductType)
  typeId: number;

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

  @HasMany(() => ProductTagMapping)
  productTagMappings: ProductTagMapping[]
}