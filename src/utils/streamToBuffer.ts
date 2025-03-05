import { Readable } from 'stream';

export default async function streamToBuffer(
    stream: Readable
): Promise<Buffer> {
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
        chunks.push(chunk);
    }
    return Buffer.concat(chunks);
}
