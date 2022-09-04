// @ts-nocheck
import { promises as fs } from 'fs'
import { defineConfig, presetAttributify, presetIcons, presetUno, transformerDirectives, transformerVariantGroup } from 'unocss'
import { compareColors, stringToColor } from '@iconify/utils/lib/colors'
import {
  deOptimisePaths,
  importDirectory,
  parseColors,
  runSVGO,
} from '@iconify/tools'
import { FileSystemIconLoader } from '@iconify/utils/lib/loader/node-loaders'
import svgToDataUri from 'mini-svg-data-uri'
function createConfig({ strict = true, dev = true } = {}) {
  return defineConfig({
    envMode: dev ? 'dev' : 'build',
    safelist: [],
    preflights: [
      {
        getCSS: ({ theme }: { theme: any }) => {
          const spacing: any = Object.values(theme.spacing)
          const baseFontSize = theme.fontSize.base[0]
          const baseLineHeight = theme.fontSize.base[1]

          const baseInput = `
            [type='text'],
            [type='email'],
            [type='url'],
            [type='password'],
            [type='number'],
            [type='date'],
            [type='datetime-local'],
            [type='month'],
            [type='search'],
            [type='tel'],
            [type='time'],
            [type='week'],
            [multiple],
            textarea,
            select {
              appearance: none;
              background-color: #fff;
              border-color: ${theme.colors.gray['500']};
              border-radius: 0;
              padding-top: ${spacing[2]};
              padding-right: ${spacing[3]};
              padding-bottom: ${spacing[2]};
              padding-left: ${spacing[3]};
              font-size: ${baseFontSize};
              line-height: ${baseLineHeight};
              --un-shadow: '0 0 #0000';
            }
            [type='text']:focus,
            [type='email']:focus,
            [type='url']:focus,
            [type='password']:focus,
            [type='number']:focus,
            [type='date']:focus,
            [type='datetime-local']:focus,
            [type='month']:focus,
            [type='search']:focus,
            [type='tel']:focus,
            [type='time']:focus,
            [type='week']:focus,
            [multiple]:focus,
            textarea:focus,
            select:focus {
              outline: 4px solid transparent;
              outline-offset: 2px;
              --un-ring-inset: var(--un-empty,/*!*/ /*!*/);
              --un-ring-offset-width: 0px;
              --un-ring-offset-color: '#fff';
              --un-ring-color: ${theme.colors.blue['600']};
              --un-ring-offset-shadow: var(--un-ring-inset) 0 0 0 var(--un-ring-offset-width) var(--un-ring-offset-color);
              --un-ring-shadow: var(--un-ring-inset) 0 0 0 calc(1px + var(--un-ring-offset-width)) var(--un-ring-color);
              box-shadow: var(--un-ring-offset-shadow), var(--un-ring-shadow), var(--un-shadow);
              border-color: ${theme.colors.blue['600']};
            }
          `

          const select = `
            select {
              background-image: url("${svgToDataUri(
              `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20"><path stroke="${theme.colors.gray['500']}" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 8l4 4 4-4"/></svg>`
          )}");
              background-position: right ${spacing[2]} center;
              background-repeat: no-repeat;
              background-size: 1.5em 1.5em;
              padding-right: ${spacing[10]};
              print-color-adjust: exact;
            }
          `

          const checkboxRadios = `
            [type="checkbox"], [type="radio"] {
              appearance: none;
              padding: 0;
              print-color-adjust: exact;
              display: inline-block;
              vertical-align: middle;
              background-origin: border-box;
              user-select: none;
              flex-shrink: 0;
              background: white;
              color: ${theme.colors.blue['600']};
              height: ${spacing[4]};
              width: ${spacing[4]};
              border-color: ${theme.colors.gray['500']};
            }
            [type='checkbox']:checked, 
            [type='radio']:checked, 
            .dark [type='checkbox']:checked,
            .dark [type='radio']:checked {
              border-color: transparent;
              background-color: currentColor;
              background-size: 100% 100%;
              background-position: center;
              background-repeat: no-repeat;
            }
            [type='checkbox']:checked  {
              background-image: url("${svgToDataUri(
              '<svg viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z"/></svg>'
          )}");
            }
            [type='checkbox']:indeterminate {
              background-image: url("${svgToDataUri(
              '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path stroke="white" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h8"/></svg>'
          )}");
              border-color: transparent;
              background-color: currentColor;
              background-size: 100% 100%;
              background-position: center;
              background-repeat: no-repeat;
            }
          `

          /**
           * I wanted to make a rule to handle the "content-['']" class ( since UnoCSS handle it like
           * that : 'content-empty' ) but it doesn't seems to be possible. That kind of dynamic rule isn't working :
           * [/^content-\['(.*)'\]$/, ([, v]) => ({ content: `"${v ? v : ''}"` })],
           *
           * So the workaround is just to inject directly the class content-['']
           */
          const emptyContentMonkeyPatch = `
            .content-\\[\\'\\'\\] {
              content: '';
            }
            
            .after\\:content-\\[\\'\\'\\]::after {
              content: '';
            }
          `

          const inputFile = `
            [type='file'] {
              background: unset;
              border-color: inherit;
              border-width: 0;
              border-radius: 0;
              padding: 0;
              font-size: unset;
              line-height: inherit;
            }
            [type='file']:focus {
              outline: '1px solid ButtonText';
              outline: '1px auto inherit';
            }
            input[type=file]::file-selector-button {
              color: white;
              background: ${theme.colors.gray['800']};
              border: 0;
              font-weight: 500;
              font-size: ${theme.fontSize.sm[0]};
              cursor: pointer;
              padding-top: ${spacing[2]};
              padding-bottom: ${spacing[2]};
              padding-left: ${spacing[8]};
              padding-right: ${spacing[4]};
              margin-inline-start: -1rem;
              margin-inline-end: 1rem;
            }
            
            input[type=file]::file-selector-button:hover {
              background: ${theme.colors.gray['700']};
            }
            .dark input[type=file]::file-selector-button {
              color: white;
              background: ${theme.colors.gray['600']};
            }
            
            .dark input[type=file]::file-selector-button:hover {
              background: ${theme.colors.gray['500']};
            }
          `

          return [baseInput, select, checkboxRadios, inputFile, emptyContentMonkeyPatch].join('\n')
        },
      },
    ],
    presets: [
      presetIcons({
        autoInstall: true,
        extraProperties: {
          'display': 'inline-block',
          'vertical-align': 'middle',
          'cursor': 'pointer',
          'width': '1em',
          'height': '1em',
        },
        collections: {
          // // Loading IconifyJSON data
          // 'test': async () => {
          //   const content = await fs.readFile(
          //     'src/core/assets/test.json',
          //     'utf8',
          //   )
          //   return JSON.parse(content)
          // },
          // 'my-other-icons': async (iconName) => {
          // 	// your custom loader here. Do whatever you want.
          // 	// for example, fetch from a remote server:
          // 	return await fetch(`https://example.com/icons/${iconName}.svg`).then(res => res.text())
          // },
          // 'my-yet-other-icons': FileSystemIconLoader(
          //   'assets/svg',
          //   svg => svg.replace(/#fff/, 'currentColor'),
          // ),
          // Loading icon set
          // 'custom-svg': async () => {
          //   // Load icons
          //   const iconSet = await importDirectory('src/core/assets/svg', {
          //     prefix: 'svg',
          //   })
          //
          //   // Clean up each icon
          //   await iconSet.forEach(async (name) => {
          //     const svg = iconSet.toSVG(name)
          //
          //     // Change color to `currentColor`
          //     const blackColor = stringToColor('black')
          //
          //     await parseColors(svg, {
          //       defaultColor: 'currentColor',
          //       callback: (attr, colorStr, color) => {
          //         // console.log('Color:', colorStr, color);
          //
          //         // Change black to 'currentColor'
          //         if (
          //           color
          //             && compareColors(color, blackColor)
          //         )
          //           return 'currentColor'
          //
          //         switch (color?.type) {
          //           case 'none':
          //           case 'current':
          //             return color
          //         }
          //
          //         throw new Error(
          //           `Unexpected color "${colorStr}" in attribute ${attr}`,
          //         )
          //       },
          //     })
          //
          //     // Optimise
          //     await runSVGO(svg)
          //
          //     // Update paths for compatibility with old software
          //     await deOptimisePaths(svg)
          //
          //     // Update icon in icon set
          //     iconSet.fromSVG(name, svg)
          //   })
          //
          //   // Export as IconifyJSON
          //   return iconSet.export()
          // },
        },
      }),
      presetUno(),
      presetAttributify(),
    ],
    transformers: [transformerDirectives(), transformerVariantGroup()],
    rules: [
      [/^text-(.+)px$/, ([, d]) => {
        if (parseInt(d) < 12) {
          return {
            'font-size': `${d}px`,
            'transform': `scale(calc(${parseInt(d)} / 12))`,
          }
        }
        return {
          'font-size': `${d}px`,
        }
      }],
    ],
  })
}
export default createConfig() as any
