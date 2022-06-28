import path from 'path';
//@ts-ignore
import loadConfigFile from 'rollup/loadConfigFile';
import { rollup } from 'rollup';
import { Shopify } from '@shopify/shopify-api';
import { Page } from '@shopify/shopify-api/dist/rest-resources/2022-04/page.js';
import { writeFile, readFile } from 'fs/promises';
import { updateBundleRefs } from '../utils/bundleUtils';

export async function build() {
  console.log('Building bundle');
  const filePath = path.resolve(__dirname, '../../rollup.config.js');
  try {
    await loadConfigFile(filePath, { format: 'es' }).then(
      async ({ options, warnings }: any) => {
        warnings.flush();
        for (const optionsObj of options) {
          console.log('loop');
          const bundle = await rollup(optionsObj);
          await Promise.all(optionsObj.output.map(bundle.write));
        }
      }
    );
    console.log('Finished build');
    return;
  } catch (error) {
    console.error('Error with build function', error);
    return error;
  }
}

export const buildBundle = async (req: any, res: any) => {
  try {
    await writeFile(
      path.resolve('./', 'src/page.json'),
      JSON.stringify(req.body.pageData)
    );
    await build();
    await updateBundleRefs();
    const html = await readFile(
      path.resolve(__dirname, '../../build/build.html'),
      'utf-8'
    );
    res.status(201).send('Page saved to Shopify');
  } catch (e) {
    console.log(e);
    res.status(500).send(e.message);
  }
};

export const sendBuild = async (req: any, res: any) => {
  try {
    const session = await Shopify.Utils.loadCurrentSession(req, res);
    if (session) {
      console.log(session);
      const page = new Page({ session: session });
      page.title = 'test';
      page.body_html = req.body.html;
      page.template_suffix = 'shogun.landing';
      await page.save({});
      return;
    } else return 'Error creating shopify session';
  } catch (e) {
    console.error(e);
    return 'Error creating page.';
  }
};
