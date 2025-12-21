import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Resolve config path relative to apps/admin directory
const configPath = path.resolve(process.cwd(), '..', '..', 'config', 'pagaliConfig.json');

export async function GET() {
    try {
        const data = await fs.readFile(configPath, 'utf-8');
        return NextResponse.json(JSON.parse(data));
    } catch (error) {
        return NextResponse.json({ error: 'Unable to read config' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { apiKey, secret, environment } = body;

        const newConfig = { apiKey, secret, environment };
        await fs.writeFile(configPath, JSON.stringify(newConfig, null, 2), 'utf-8');

        return NextResponse.json(newConfig);
    } catch (error) {
        return NextResponse.json({ error: 'Unable to write config' }, { status: 500 });
    }
}
