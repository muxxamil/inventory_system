'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    await Promise.all([
      queryInterface.sequelize.query('CREATE TABLE user (id int(11) NOT NULL AUTO_INCREMENT,name varchar(200) DEFAULT NULL,githubId varchar(300) NOT NULL,createdAt timestamp NULL DEFAULT current_timestamp(),PRIMARY KEY (id),UNIQUE KEY githubId (githubId))'),
      queryInterface.sequelize.query('CREATE TABLE city (id int(11) NOT NULL AUTO_INCREMENT,`key` varchar(300) NOT NULL,name varchar(150) NOT NULL,addedBy int(11) NOT NULL,createdAt timestamp NOT NULL DEFAULT current_timestamp(),PRIMARY KEY (id),UNIQUE KEY `key` (`key`))'),
      queryInterface.sequelize.query('CREATE TABLE file (id int(11) NOT NULL AUTO_INCREMENT,name varchar(200) NOT NULL,type enum("inventory","product") NOT NULL,extension enum("csv","xml") NOT NULL,addedBy int(11) NOT NULL,createdAt timestamp NOT NULL DEFAULT current_timestamp(),PRIMARY KEY (id))'),
      queryInterface.sequelize.query('CREATE TABLE inventory (id int(11) NOT NULL AUTO_INCREMENT,cityId int(11) NOT NULL,productId int(11) NOT NULL,amount float NOT NULL,addedBy int(11) NOT NULL,updatedBy int(11) DEFAULT NULL,createdAt datetime NOT NULL,updatedAt timestamp NOT NULL DEFAULT current_timestamp(),PRIMARY KEY (id),UNIQUE KEY productId_cityId (productId,cityId))'),
      queryInterface.sequelize.query('CREATE TABLE product (id int(11) NOT NULL AUTO_INCREMENT,`key` varchar(200) NOT NULL,title varchar(500) NOT NULL,html text DEFAULT NULL,vendorId int(11) NOT NULL,scopeId int(11) NOT NULL,imageId int(11) DEFAULT NULL,typeId int(11) NOT NULL,addedBy int(11) NOT NULL,updatedBy int(11) DEFAULT NULL,createdAt datetime NOT NULL,updatedAt timestamp NOT NULL DEFAULT current_timestamp(),PRIMARY KEY (id),UNIQUE KEY `key` (`key`))'),
      queryInterface.sequelize.query('CREATE TABLE product_image (id int(11) NOT NULL AUTO_INCREMENT,`key` varchar(50) NOT NULL,width int(11) NOT NULL,height int(11) NOT NULL,src varchar(500) NOT NULL,addedBy int(11) NOT NULL,createdAt timestamp NOT NULL DEFAULT current_timestamp(),PRIMARY KEY (id),UNIQUE KEY `key` (`key`))'),
      queryInterface.sequelize.query('CREATE TABLE product_tag (id int(11) NOT NULL AUTO_INCREMENT,`key` varchar(200) NOT NULL,name varchar(100) NOT NULL,addedBy int(11) NOT NULL,createdAt timestamp NOT NULL DEFAULT current_timestamp(),PRIMARY KEY (id),UNIQUE KEY `key` (`key`))'),
      queryInterface.sequelize.query('CREATE TABLE product_tag_mapping (id int(11) NOT NULL AUTO_INCREMENT,productId int(11) NOT NULL,tagId int(11) NOT NULL,addedBy int(11) NOT NULL,createdAt timestamp NOT NULL DEFAULT current_timestamp(),PRIMARY KEY (id),UNIQUE KEY productId (productId,tagId))'),
      queryInterface.sequelize.query('CREATE TABLE product_type (id int(11) NOT NULL AUTO_INCREMENT,`key` varchar(200) NOT NULL,name varchar(100) NOT NULL,addedBy int(11) NOT NULL,createdAt timestamp NOT NULL DEFAULT current_timestamp(),PRIMARY KEY (id),UNIQUE KEY `key` (`key`))'),
      queryInterface.sequelize.query('CREATE TABLE published_scope (id int(11) NOT NULL AUTO_INCREMENT,`key` varchar(200) NOT NULL,name varchar(100) NOT NULL,addedBy int(11) NOT NULL,createdAt timestamp NOT NULL DEFAULT current_timestamp(),PRIMARY KEY (id),UNIQUE KEY `key` (`key`))'),
      queryInterface.sequelize.query('CREATE TABLE vendor (id int(11) NOT NULL AUTO_INCREMENT,`key` varchar(400) NOT NULL,name varchar(200) NOT NULL,addedBy int(11) NOT NULL,createdAt datetime NOT NULL,updatedAt timestamp NOT NULL DEFAULT current_timestamp(),PRIMARY KEY (id),UNIQUE KEY `key` (`key`))')
    ]);

  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */

    await Promise.all([
      queryInterface.dropTable('city'),
      queryInterface.dropTable('inventory'),
      queryInterface.dropTable('product'),
      queryInterface.dropTable('file'),
      queryInterface.dropTable('product_tag_mapping'),
      queryInterface.dropTable('user'),
      queryInterface.dropTable('product_image'),
      queryInterface.dropTable('product_tag'),
      queryInterface.dropTable('product_type'),
      queryInterface.dropTable('published_scope'),
      queryInterface.dropTable('vendor')
    ]);
  }
};
