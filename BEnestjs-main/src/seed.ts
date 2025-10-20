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
  const fournisseurModel = app.get(getModelToken('Fournisseur'));
  const stockModel = app.get(getModelToken('Stock'));
  const dailyAssignmentModel = app.get(getModelToken('DailyAssignment'));

  console.log('🌱 Starting database seeding...\n');

  try {
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await personnelModel.deleteMany({});
    await chantierModel.deleteMany({});
    await vehiculeModel.deleteMany({});
    await fournisseurModel.deleteMany({});
    await stockModel.deleteMany({});
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

    // 4. Seed Fournisseurs (Suppliers)
    console.log('🏢 Seeding Suppliers...');
    const fournisseurs = await fournisseurModel.insertMany([
      {
        name: 'Tunisian Cement Co.',
        contact: 'Ali Ben Salem',
        phone: '+216 71 123 456',
        email: 'contact@tuncement.tn',
        address: 'Zone Industrielle, Tunis',
        category: 'Materials',
        note: 'Main cement supplier - Good prices',
      },
      {
        name: 'Steel & Iron Supplies',
        contact: 'Fatma Trabelsi',
        phone: '+216 71 234 567',
        email: 'info@steelsupply.tn',
        address: 'Rue de la République, Sfax',
        category: 'Materials',
        note: 'Reliable steel supplier',
      },
      {
        name: 'Fuel Express Tunisia',
        contact: 'Mehdi Karoui',
        phone: '+216 71 345 678',
        email: 'sales@fuelexpress.tn',
        address: 'Route de Sousse, Tunis',
        category: 'Fuel',
        note: 'Diesel and gasoline supplier',
      },
      {
        name: 'Hardware Tools Plus',
        contact: 'Nadia Cherif',
        phone: '+216 71 456 789',
        email: 'contact@hwtools.tn',
        address: 'Avenue Habib Bourguiba, Tunis',
        category: 'Tools',
        note: 'Quality construction tools',
      },
      {
        name: 'Safety Equipment Pro',
        contact: 'Youssef Gharbi',
        phone: '+216 71 567 890',
        email: 'safety@safetyequip.tn',
        address: 'Ariana, Tunisia',
        category: 'Safety',
        note: 'PPE and safety equipment',
      },
    ]);
    console.log(`✅ Created ${fournisseurs.length} suppliers\n`);

    // 5. Seed Stock
    console.log('📦 Seeding Stock Items...');
    const stock = await stockModel.insertMany([
      {
        name: 'Cement Bags',
        quantity: 500,
        unit: 'bags',
        category: 'Materials',
        minQuantity: 100,
        fournisseur: fournisseurs[0]._id,
        chantier: chantiers[0]._id,
      },
      {
        name: 'Steel Rods (12mm)',
        quantity: 250,
        unit: 'pieces',
        category: 'Materials',
        minQuantity: 50,
        fournisseur: fournisseurs[1]._id,
        chantier: chantiers[0]._id,
      },
      {
        name: 'Diesel Fuel',
        quantity: 1500,
        unit: 'liters',
        category: 'Fuel',
        minQuantity: 500,
        fournisseur: fournisseurs[2]._id,
        chantier: chantiers[1]._id,
      },
      {
        name: 'Power Drills',
        quantity: 15,
        unit: 'pieces',
        category: 'Tools',
        minQuantity: 5,
        fournisseur: fournisseurs[3]._id,
      },
      {
        name: 'Safety Helmets',
        quantity: 45,
        unit: 'pieces',
        category: 'Safety',
        minQuantity: 20,
        fournisseur: fournisseurs[4]._id,
      },
      {
        name: 'Steel Rods (16mm)',
        quantity: 180,
        unit: 'pieces',
        category: 'Materials',
        minQuantity: 50,
        fournisseur: fournisseurs[1]._id,
        chantier: chantiers[2]._id,
      },
      {
        name: 'Cement Bags',
        quantity: 80,
        unit: 'bags',
        category: 'Materials',
        minQuantity: 100,
        fournisseur: fournisseurs[0]._id,
        chantier: chantiers[3]._id,
      },
      {
        name: 'Safety Vests',
        quantity: 12,
        unit: 'pieces',
        category: 'Safety',
        minQuantity: 15,
        fournisseur: fournisseurs[4]._id,
      },
    ]);
    console.log(`✅ Created ${stock.length} stock items\n`);

    // 6. Seed Daily Assignments
    console.log('📋 Seeding Daily Assignments...');
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const dailyAssignments = await dailyAssignmentModel.insertMany([
      {
        date: yesterday,
        chantier: chantiers[0]._id,
        personnelAssignments: [
          {
            personnel: personnel[0]._id,
            isPayed: true,
            salary: 120,
            notes: 'Supervised foundation work',
          },
          {
            personnel: personnel[2]._id,
            isPayed: true,
            salary: 90,
            notes: 'Concrete pouring',
          },
        ],
        vehiculeAssignments: [
          {
            vehicule: vehicules[0]._id,
            notes: 'Material transport',
          },
          {
            vehicule: vehicules[2]._id,
            notes: 'Site preparation',
          },
        ],
        fuelCosts: [
          {
            description: 'Diesel for dump truck',
            amount: 75.5,
            paymentMethod: 'cash',
            notes: 'TUN-1234',
          },
          {
            description: 'Diesel for bulldozer',
            amount: 120.0,
            paymentMethod: 'credit_card',
            notes: 'TUN-9012',
          },
        ],
        totalPersonnelCost: 210,
        totalFuelCost: 195.5,
        totalCost: 405.5,
        notes: 'Foundation work completed',
      },
      {
        date: yesterday,
        chantier: chantiers[1]._id,
        personnelAssignments: [
          {
            personnel: personnel[1]._id,
            isPayed: false,
            salary: 150,
            notes: 'Road design supervision',
          },
          {
            personnel: personnel[3]._id,
            isPayed: true,
            salary: 110,
            notes: 'Electrical installations',
          },
        ],
        vehiculeAssignments: [
          {
            vehicule: vehicules[1]._id,
            notes: 'Excavation work',
          },
        ],
        fuelCosts: [
          {
            description: 'Diesel for excavator',
            amount: 95.0,
            paymentMethod: 'cash',
            notes: 'TUN-5678',
          },
        ],
        totalPersonnelCost: 260,
        totalFuelCost: 95.0,
        totalCost: 355.0,
        notes: 'Road excavation in progress',
      },
      {
        date: twoDaysAgo,
        chantier: chantiers[0]._id,
        personnelAssignments: [
          {
            personnel: personnel[0]._id,
            isPayed: true,
            salary: 120,
            notes: 'Site inspection',
          },
          {
            personnel: personnel[4]._id,
            isPayed: true,
            salary: 95,
            notes: 'Masonry work',
          },
        ],
        vehiculeAssignments: [
          {
            vehicule: vehicules[3]._id,
            notes: 'Material pickup',
          },
        ],
        fuelCosts: [
          {
            description: 'Gasoline for pickup',
            amount: 45.0,
            paymentMethod: 'cash',
            notes: 'TUN-3456',
          },
        ],
        totalPersonnelCost: 215,
        totalFuelCost: 45.0,
        totalCost: 260.0,
        notes: 'Material procurement day',
      },
      {
        date: twoDaysAgo,
        chantier: chantiers[3]._id,
        personnelAssignments: [
          {
            personnel: personnel[2]._id,
            isPayed: false,
            salary: 90,
            notes: 'Bridge cleaning',
          },
        ],
        vehiculeAssignments: [
          {
            vehicule: vehicules[4]._id,
            notes: 'Debris removal',
          },
        ],
        fuelCosts: [
          {
            description: 'Diesel for excavator',
            amount: 85.0,
            paymentMethod: 'check',
            notes: 'TUN-7890',
          },
        ],
        totalPersonnelCost: 90,
        totalFuelCost: 85.0,
        totalCost: 175.0,
        notes: 'Preparation work for bridge renovation',
      },
    ]);
    console.log(`✅ Created ${dailyAssignments.length} daily assignments\n`);

    console.log('🎉 Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Personnel: ${personnel.length}`);
    console.log(`   - Work Sites: ${chantiers.length}`);
    console.log(`   - Vehicles: ${vehicules.length}`);
    console.log(`   - Suppliers: ${fournisseurs.length}`);
    console.log(`   - Stock Items: ${stock.length}`);
    console.log(`   - Daily Assignments: ${dailyAssignments.length}`);
    console.log('\n✅ You can now test your application with this data!\n');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
