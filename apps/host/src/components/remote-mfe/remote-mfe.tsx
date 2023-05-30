import {
  component$,
  SSRStream,
  SSRStreamBlock,
  StreamWriter,
} from '@builder.io/qwik';
import { fixRemoteHTMLInDevMode } from 'apps/host/shared';
import { type RemoteData } from '../../../../../shared/remotes';

export interface Props {
  remote: RemoteData;
  removeLoader?: boolean;
}

export default component$(({ remote, removeLoader = false }: Props) => {
  const url = remote.url;
  const decoder = new TextDecoder();
  const getSSRStreamFunction =
    (remoteUrl: string) => async (stream: StreamWriter) => {
      const reader = (
        await fetch(remoteUrl, { headers: { accept: 'text/html' } })
      ).body!.getReader();
      let fragmentChunk = await reader.read();
      let base = '';
      while (!fragmentChunk.done) {
        const rawHtml = decoder.decode(fragmentChunk.value);
        const fixedHtmlObj = fixRemoteHTMLInDevMode(
          rawHtml,
          base,
          removeLoader
        );
        base = fixedHtmlObj.base;
        stream.write(fixedHtmlObj.html);
        fragmentChunk = await reader.read();
      }
    };

  return (
    <SSRStreamBlock>
      <SSRStream>{getSSRStreamFunction(url)}</SSRStream>
    </SSRStreamBlock>
  );
});