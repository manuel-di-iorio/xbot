import { Attachment, Events } from "discord.js";
import speech from '@google-cloud/speech';
import axios from "axios";
import ffmpeg from 'fluent-ffmpeg';
import internal, { Stream } from "stream";
import { unlink, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { addEvent } from "../lib/discord/events/index.js";
import { logger } from "../logger.js";
import { NEWLINE } from "../utils/newline.js";
import {
  GOOGLE_SERVICEACCOUNT,
  // WITAI_APIKEY
} from "../config.js";
import { addModule } from "./index.js";

const tmpPath = tmpdir();
const client = new speech.SpeechClient({
  credentials: GOOGLE_SERVICEACCOUNT
});

// const { Wit, log } = WitPkg;
// const witClient = new Wit({
//   accessToken: WITAI_APIKEY,
//   logger: new log.Logger(log.DEBUG),
// });

const saveAttachment = async (tmpname: string, url: string) => {
  const { data } = await axios(url, {
    responseType: 'arraybuffer',
    headers: {
      'Content-Type': 'audio/ogg'
    }
  });
  await writeFile(tmpname, Buffer.from(data));
};

// const convertToWav = (tmpname: string, passStream: internal.Writable) => {
//   // return new Promise((resolve, reject) => {
//   // Write the file to the passthrough stream
//   ffmpeg(tmpname)
//     .addOption('-ac', '1')
//     .toFormat("wav")
//     .on('error', (err) => logger.error(err))
//     // .saveToFile('discord-voice-message.wav')
//     // .on('end', resolve);
//     .writeToStream(passStream);

//   // Read the passthrough stream
//   // const buffers: Buffer[] = [];
//   // bufferStream.on('data', (buf) => {
//   //   buffers.push(buf);
//   // });
//   // bufferStream.on('end', () => {
//   //   resolve(Buffer.concat(buffers));
//   // });
//   // });
// };

const convertToWav = (tmpname: string, passStream: internal.Writable): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    // Write the file to the passthrough stream
    ffmpeg(tmpname)
      .addOption('-ac', '1')
      .toFormat("wav")
      .writeToStream(passStream);

    // Read the passthrough stream
    const buffers: Buffer[] = [];
    passStream.on('data', (buf) => buffers.push(buf));
    passStream.on('error', reject);
    passStream.on('end', () => {
      resolve(Buffer.concat(buffers));
    });
  });
};

const transcribeBuffer = async (outputBuffer: Buffer) => {
  const audio: speech.protos.google.cloud.speech.v1.IRecognitionAudio = {
    content: outputBuffer
  };
  const config: speech.protos.google.cloud.speech.v1.IRecognitionConfig = {
    encoding: 'LINEAR16',
    sampleRateHertz: 48000,
    languageCode: 'it-IT',
  };
  const request: speech.protos.google.cloud.speech.v1.IRecognizeRequest = {
    audio: audio,
    config: config,
  };

  const [response] = await client.recognize(request);
  if (!response) return;
  const results = response.results;
  if (!results) return;

  return results
    .map(result => result.alternatives?.[0].transcript)
    .join('\n');

  // https://cloud.google.com/speech-to-text/docs/transcribe-streaming-audio?hl=it
  // const stream = await client.streamingRecognize(request);
  // stream.on('data', (response) => { console.log(response); });
  // stream.on('error', (err) => { logger.error(err); });
  // stream.on('end', () => { /* API call completed */ });
  // stream.write(request);
  // stream.end();
};

export const TranscribeVoiceMsgModule = () => addModule("TranscribeVoiceMsg", () => {
  addEvent(Events.MessageCreate, async (msg) => {
    const { attachments } = msg;
    if (attachments.size !== 1) return;
    const attachment = attachments.first() as Attachment;
    if (attachment.contentType !== "audio/ogg") return;

    try {
      const tmpname = join(tmpPath, "discord-voice-message.ogg");
      await saveAttachment(tmpname, attachment.url);

      const passStream = new Stream.PassThrough();
      const outputBuffer = await convertToWav(tmpname, passStream);

      // const binary = await readFile(tmpname);
      // const readStream = createReadStream("discord-voice-message.wav");
      // readStream.on('error', (err) => logger.error(err));


      // witClient.dictation("audio/wav", passStream)
      //   // @ts-expect-error test
      //   .on('partialTranscription', (...data) => console.log(data, 'partial'))
      //   // @ts-expect-error test
      //   .on('fullTranscription ', (...data) => console.log(data, 'full'))
      //   // @ts-expect-error test
      //   .end('end', (final) => console.log(final, 'final-end'));


      // const { data: responseStream } = await axios({
      //   method: "POST",
      //   url: 'https://api.wit.ai/dictation?v=20230215',
      //   headers: {
      //     'Authorization': `Bearer ${WITAI_APIKEY}`,
      //     'Content-Type': "audio/ogg",
      //     // 'Transfer-encoding': 'chunked'
      //   },
      //   data: Buffer.from(binary)//stream,
      //   // responseType: 'stream',
      // });
      // console.log(responseStream);

      // responseStream.on('data', data => {
      //   data = data.toString();
      //   console.log(data);
      // });

      await unlink(tmpname);
      const transcription = await transcribeBuffer(outputBuffer);
      if (!transcription?.trim()) return;
      await msg.reply(`**Testo:**${NEWLINE + transcription}`);
    } catch (err) {
      logger.error(err);
    }
  });
});
