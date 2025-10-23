import { supabase } from '@/lib/auth/supabase-auth';

const testUsers = [
  {
    email: 'emma@test.com',
    name: 'Emma Schmidt',
    bio: 'Kaffeeliebhaberin und Bücherwurm. Auf der Suche nach jemandem für gemütliche Café-Dates!',
    age: 28,
    gender: 'female',
    location: 'Berlin',
    photos: ['https://randomuser.me/api/portraits/women/1.jpg'],
    phone: '+491234567890',
    interests: ['Kaffee', 'Bücher', 'Kunst', 'Reisen'],
  },
  {
    email: 'max@test.com',
    name: 'Max Müller',
    bio: 'Foodie und Abenteurer. Lass uns zusammen neue Restaurants entdecken!',
    age: 32,
    gender: 'male',
    location: 'Berlin',
    photos: ['https://randomuser.me/api/portraits/men/1.jpg'],
    phone: '+491234567891',
    interests: ['Essen', 'Sport', 'Musik', 'Kochen'],
  },
  {
    email: 'sarah@test.com',
    name: 'Sarah Fischer',
    bio: 'Yoga-Enthusiastin und Naturliebhaberin. Suche jemanden für Outdoor-Aktivitäten.',
    age: 26,
    gender: 'female',
    location: 'Berlin',
    photos: ['https://randomuser.me/api/portraits/women/2.jpg'],
    phone: '+491234567892',
    interests: ['Yoga', 'Natur', 'Gesundheit', 'Meditation'],
  },
  {
    email: 'tom@test.com',
    name: 'Tom Weber',
    bio: 'Tech-Nerd und Gaming-Fan. Bereit für virtuelle und reale Abenteuer!',
    age: 29,
    gender: 'male',
    location: 'Berlin',
    photos: ['https://randomuser.me/api/portraits/men/2.jpg'],
    phone: '+491234567893',
    interests: ['Gaming', 'Technologie', 'Filme', 'Pizza'],
  },
  {
    email: 'julia@test.com',
    name: 'Julia Wagner',
    bio: 'Künstlerin und Träumerin. Lass uns die schönsten Cafés der Stadt erkunden!',
    age: 30,
    gender: 'female',
    location: 'Berlin',
    photos: ['https://randomuser.me/api/portraits/women/3.jpg'],
    phone: '+491234567894',
    interests: ['Kunst', 'Fotografie', 'Kaffee', 'Mode'],
  },
  {
    email: 'daniel@test.com',
    name: 'Daniel Becker',
    bio: 'Sportbegeistert und lebensfroh. Suche Partnerin für aktive Dates!',
    age: 34,
    gender: 'male',
    location: 'Berlin',
    photos: ['https://randomuser.me/api/portraits/men/3.jpg'],
    phone: '+491234567895',
    interests: ['Fitness', 'Basketball', 'Kochen', 'Wandern'],
  },
  {
    email: 'lisa@test.com',
    name: 'Lisa Meyer',
    bio: 'Weltenbummlerin mit Fernweh. Bereit für kulinarische Abenteuer!',
    age: 27,
    gender: 'female',
    location: 'Berlin',
    photos: ['https://randomuser.me/api/portraits/women/4.jpg'],
    phone: '+491234567896',
    interests: ['Reisen', 'Sprachen', 'Kultur', 'Street Food'],
  },
  {
    email: 'chris@test.com',
    name: 'Christian Hoffmann',
    bio: 'Musiker und Kaffee-Connoisseur. Auf der Suche nach meiner Duett-Partnerin!',
    age: 31,
    gender: 'male',
    location: 'Berlin',
    photos: ['https://randomuser.me/api/portraits/men/4.jpg'],
    phone: '+491234567897',
    interests: ['Musik', 'Gitarre', 'Kaffee', 'Konzerte'],
  },
];

export async function seedTestData() {
  console.log('🌱 Seeding test data...');

  try {
    // Insert test users
    for (const userData of testUsers) {
      console.log(`Creating user: ${userData.email}`);
      
      // First create auth user
      const { data: authUser, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: 'testpassword123',
        options: {
          data: {
            name: userData.name
          }
        }
      });

      if (authError) {
        if (authError.message.includes('already registered') || authError.message.includes('already been registered')) {
          console.log(`⚠️ User ${userData.email} already exists in auth`);
          
          // Try to get existing user and create profile if missing
          const { data: existingProfile } = await supabase
            .from('users')
            .select('id')
            .eq('email', userData.email)
            .single();

          if (!existingProfile) {
            // Create profile with a new UUID
            const { error: profileError } = await supabase
              .from('users')
              .insert({
                email: userData.email,
                name: userData.name,
                phone: userData.phone,
                photos: userData.photos,
                bio: userData.bio,
                age: userData.age,
                gender: userData.gender as 'male' | 'female' | 'other',
                location: userData.location,
                interests: userData.interests,
                is_online: Math.random() > 0.5,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });

            if (profileError && profileError.code !== '23505') {
              console.error(`Profile error for ${userData.email}:`, profileError);
            } else {
              console.log(`✅ Created profile for existing user: ${userData.name}`);
            }
          }
        } else {
          console.error(`Auth error for ${userData.email}:`, authError);
        }
        continue;
      }

      // Then create user profile
      if (authUser.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: authUser.user.id,
            email: userData.email,
            name: userData.name,
            phone: userData.phone,
            photos: userData.photos,
            bio: userData.bio,
            age: userData.age,
            gender: userData.gender as 'male' | 'female' | 'other',
            location: userData.location,
            interests: userData.interests,
            is_online: Math.random() > 0.5,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (profileError && profileError.code !== '23505') {
          console.error(`Profile error for ${userData.email}:`, profileError);
        } else {
          console.log(`✅ Created user: ${userData.name} (${userData.email})`);
        }
      }
    }

    console.log('🎉 Test data seeding completed!');
    console.log('📧 You can now login with:');
    console.log('   Email: emma@test.com');
    console.log('   Password: testpassword123');
    
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  }
}

// Run if called directly
if (typeof window === 'undefined') {
  seedTestData();
}