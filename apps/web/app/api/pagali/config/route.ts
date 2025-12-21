import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const configPath = path.resolve(process.cwd(), '..', '..', 'config', 'pagaliConfig.json');

export async function GET() {
    try {
        const data = await fs.readFile(configPath, 'utf-8');
        return NextResponse.json(JSON.parse(data));
    } catch (err) {
        return NextResponse.json({ error: 'Unable to read config' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        await fs.writeFile(configPath, JSON.stringify(body, null, 2));
        return NextResponse.json(body);
    } catch (err) {
        return NextResponse.json({ error: 'Unable to write config' }, { status: 500 });
    }
}
