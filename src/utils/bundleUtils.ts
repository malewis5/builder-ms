//@ts-check
import { parse } from 'node-html-parser';
import { writeFile, readFile } from 'fs/promises';
import { Buffer } from 'buffer';
import path from 'path';
import cloudinary from 'cloudinary';
import 'dotenv/config';

// @ts-ignore
cloudinary.config({
  cloud_name: 'dn4bh5hdx',
  api_key: '969544235384938',
  api_secret: 'Jo9KZ55BkPNUWZ7MHT5td90xt2Q',
});

const uploadFileToCloudinary = async (filePath: string) => {
  const resolvedFilePath = path.resolve(__dirname, filePath);
  const response = await cloudinary.v2.uploader
    .upload(resolvedFilePath, { resource_type: 'auto' })
    .then((res) => {
      return res;
    })
    .catch((e) => {
      throw new Error(`Error uploading file to Cloudinary: ${e.message}`);
    });
  return response;
};

export const updateBundleRefs = async () => {
  console.log('started updating refs.');
  try {
    const htmlFile = await readFile(
      path.resolve(__dirname, '../../build/build.html'),
      'utf-8',
      //@ts-ignore
      (err, data) => {
        if (err) console.error('ERROR');
        else {
          console.log(data);
          return data;
        }
      }
    );

    const jsUploadResult = await uploadFileToCloudinary(
      '../../build/bundle.js'
    );
    const cssUploadResult = await uploadFileToCloudinary(
      '../../build/bundle.css'
    );

    const dom = parse(htmlFile);
    const root = dom.getElementById('root');
    const css = dom.querySelector('link[href=bundle.css]');
    const js = dom.querySelector('script[src=bundle.js]');

    if (js && css && root) {
      css.setAttribute('href', cssUploadResult.url);
      js.setAttribute('src', jsUploadResult.url);
      root.appendChild(js);
      root.appendChild(css);
    }

    console.log('Finished updating refs.');
    try {
      // const controller = new AbortController();
      // const { signal } = controller;
      const data = new Uint8Array(Buffer.from(root.toString()));
      writeFile('./build/build.html', data);

      // // Abort the request before the promise settles.
      // controller.abort();
    } catch (err) {
      // When a request is aborted - err is an AbortError
      console.error(err);
    }
  } catch (e) {
    console.error(e);
  }
};
