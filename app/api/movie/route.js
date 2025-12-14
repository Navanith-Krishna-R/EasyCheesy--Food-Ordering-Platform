import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db("sample_mflix");

        // Fetch one movie
        const movie = await db.collection("movies").findOne({});

        // Return the data as JSON
        return NextResponse.json(movie);
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}