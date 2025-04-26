import { NextResponse } from 'next/server';
import { collection, getDocs, query, limit, offset, orderBy, Timestamp,getCountFromServer  } from 'firebase/firestore';
import { db } from '@/firebase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    if (isNaN(page) || isNaN(pageSize) || page < 1 || pageSize < 1) {
      return new NextResponse(JSON.stringify({ error: 'Invalid page or pageSize parameters' }), { status: 400 });
    }

    const soundsCollection = collection(db, 'sounds');
    const snapshot = await getCountFromServer(soundsCollection);
    const totalSounds = snapshot.data().count;
    const totalPages = Math.ceil(totalSounds / pageSize);
    const soundsQuery = query(soundsCollection, orderBy('created_at', 'desc'), limit(pageSize), offset((page - 1) * pageSize));
    const querySnapshot = await getDocs(soundsQuery);

    const sounds = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      created_at: (doc.data().created_at as Timestamp).toDate(),
    }));

    return new NextResponse(JSON.stringify({
      sounds,
      totalSounds,
      currentPage: page,
      totalPages,
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching sounds:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to fetch sounds' }), { status: 500 });
  }
}