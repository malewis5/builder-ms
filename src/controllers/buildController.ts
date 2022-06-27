import path from 'path';
import * as json from '../page.json';
//@ts-ignore
import loadConfigFile from 'rollup/loadConfigFile';
import { rollup } from 'rollup';
import { Shopify } from '@shopify/shopify-api';
import { Page } from '@shopify/shopify-api/dist/rest-resources/2022-04/page.js';
import { writeFile } from 'fs/promises';
import { updateBundleRefs } from '../utils/bundleUtils';

async function build() {
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
    await writeFile(path.resolve('./', 'src/page.json'), JSON.stringify(json));
    await build();
    await updateBundleRefs();
    res.status(201).send('Done with bundle');
  } catch (e) {
    res.status(500).send('Error creating bundle');
  }
};

export const sendBuild = async (req: any, res: any) => {
  try {
    const session = await Shopify.Utils.loadCurrentSession(req, res);
    if (session) {
      const page = new Page({ session: session });
      page.title = req.body.title;
      // page.body_html = bodyHtml;
      page.template_suffix = req.body.template_suffix;
      await page.save({});
      res.status(201).send('Page created successfully');
    }
  } catch (e) {
    console.error(e);
    res.status(500).send('Error creating page.');
  }
};
