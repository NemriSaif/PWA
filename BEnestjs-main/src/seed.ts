import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  // Get all models
  const personnelModel = app.get(getModelToken('Personnel'));
  const chantierModel = app.get(getModelToken('Chantier'));
  const vehiculeModel = app.get(getModelToken('Vehicule'));
  const dailyAssignmentModel = app.get(getModelToken('DailyAssignment'));

  console.log('🌱 Starting database seeding...\n');

  try {
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await personnelModel.deleteMany({});
    await chantierModel.deleteMany({});
    await vehiculeModel.deleteMany({});
    await dailyAssignmentModel.deleteMany({});
    console.log('✅ Existing data cleared\n');

    // 1. Seed Personnel
    console.log('👷 Seeding Personnel...');
    const personnel = await personnelModel.insertMany([
      {
        name: 'Ahmed Mansour',
        role: 'Foreman',
        salary: 1200,
        phone: '+216 20 123 456',
        email: 'ahmed.mansour@example.com',
        address: 'Tunis, Tunisia',
      },
      {
        name: 'Saif Nemri',
        role: 'Engineer',
        salary: 1500,
        phone: '+216 20 234 567',
        email: 'saif.nemri@example.com',
        address: 'Ariana, Tunisia',
      },
      {
        name: 'Raed Nasri',
        role: 'Construction Worker',
        salary: 900,
        phone: '+216 20 345 678',
        email: 'raed.nasri@example.com',
        address: 'Bizerte, Tunisia',
      },
      {
        name: 'Mohamed Khirallah',
        role: 'Electrician',
        salary: 1100,
        phone: '+216 20 456 789',
        email: 'mohamed.khirallah@example.com',
        address: 'Sfax, Tunisia',
      },
      {
        name: 'Ka Rim',
        role: 'Mason',
        salary: 950,
        phone: '+216 20 567 890',
        email: 'ka.rim@example.com',
        address: 'Sousse, Tunisia',
      },
    ]);
    console.log(`✅ Created ${personnel.length} personnel\n`);

    // 2. Seed Chantiers (Work Sites)
    console.log('🏗️  Seeding Work Sites...');
    const chantiers = await chantierModel.insertMany([
      {
        name: 'Construction Site Alpha',
        location: 'Tunis Centre-Ville',
        description: 'Residential building construction - 5 floors',
        status: 'active',
        budget: 250000,
      },
      {
        name: 'Road Work Project Beta',
        location: 'Route de Bizerte',
        description: 'Highway expansion and renovation',
        status: 'active',
        budget: 500000,
      },
      {
        name: 'Commercial Complex Gamma',
        location: 'La Marsa',
        description: 'Shopping mall construction',
        status: 'planning',
        budget: 800000,
      },
      {
        name: 'Bridge Renovation Delta',
        location: 'Sfax',
        description: 'Old bridge structural reinforcement',
        status: 'active',
        budget: 150000,
      },
    ]);
    console.log(`✅ Created ${chantiers.length} work sites\n`);

    // 3. Seed Vehicules
    console.log('🚗 Seeding Vehicles...');
    const vehicules = await vehiculeModel.insertMany([
      {
        immatriculation: 'TUN-1234',
        marque: 'Mercedes',
        modele: 'Actros',
        type: 'Dump Truck',
        kilometrage: 45000,
        chantier: chantiers[0]._id,
      },
      {
        immatriculation: 'TUN-5678',
        marque: 'Volvo',
        modele: 'EC200D',
        type: 'Excavator',
        kilometrage: 12000,
        chantier: chantiers[1]._id,
      },
      {
        immatriculation: 'TUN-9012',
        marque: 'Caterpillar',
        modele: 'D6T',
        type: 'Bulldozer',
        kilometrage: 8500,
        chantier: chantiers[0]._id,
      },
      {
        immatriculation: 'TUN-3456',
        marque: 'Toyota',
        modele: 'Hilux',
        type: 'Pickup Truck',
        kilometrage: 65000,
      },
      {
        immatriculation: 'TUN-7890',
        marque: 'Komatsu',
        modele: 'PC200',
        type: 'Excavator',
        kilometrage: 15000,
        chantier: chantiers[3]._id,
      },
    ]);
    console.log(`✅ Created ${vehicules.length} vehicles\n`);

    console.log(' Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Personnel: ${personnel.length}`);
    console.log(`   - Work Sites: ${chantiers.length}`);
    console.log(`   - Vehicles: ${vehicules.length}`);
    console.log('\n✅ You can now test your application with this data!\n');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
