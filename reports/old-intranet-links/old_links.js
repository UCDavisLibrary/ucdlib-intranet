import path from 'path';
import { JSDOM } from 'jsdom';
import { Parser as Json2csvParser } from 'json2csv';
import { writeFile } from 'fs/promises';

/**
 * @description Class to generate a report of old intranet links from WordPress pages and groups
 * @class OldLinksReport
 * @param {Array} bases - array of base URLs to check for old links
 */
export default class OldLinksReport {
  constructor(bases, config, dirname) {
    this.pages = [];
    this.groups = [];
    this.report = [];
    this.csv = '';
    this.bases = bases;
    this.dirname = dirname;

    // Basic Auth
    const username = config.wpUser;
    const password = config.wpPass;
    this.auth = "Basic " + Buffer.from(`${username}:${password}`).toString("base64");
    this.pages_endpoint = `${config.wpBase}/pages?context=edit&per_page=${config.wpPage}`;
    this.groups_endpoint = `${config.wpBase}/ucdlib-group?context=edit&per_page=${config.wpPage}`;
  }

  /**
   * @description generate the report
  */
  async generate() {
    this.pages = await this.fetchLinks(this.pages_endpoint);
    this.groups = await this.fetchLinks(this.groups_endpoint);
    
    for (const p of this.pages) {
        console.log(`Processing page ID ${p.id} - ${p.slug}`);
    }
    for (const g of this.groups) {
        console.log(`Processing group ID ${g.id} - ${g.slug}`);
    }
    this.processLinks();
    this.saveReport();
  }

    /**
     * @description flatten refs from extractedRefs
     * @param {Array} extractedRefs
     * @return {Array} flattened refs
     */
    flattenRefs(extractedRefs = []) {
        return (extractedRefs || []).reduce((acc, item) => {
            const { type, id, permalink, slug } = item;
            for (const { linktype, url, text, alt } of (item.refs || [])) {
                acc.push({ type, id, permalink, slug, linktype, url, text, alt });
            }
        return acc;
        }, []);
    }

    /**
     * @description extract refs info from html content
     * @param {String} html WP_REST content
     * @param {Object} instance page or group instance
     * @returns {Object|Boolean} info object or false if no refs found
     */
    extractRefsInfo(html, instance={}) {
        let info = {
            type: instance.type || 'unknown',
            id: instance.id || 0,
            permalink: instance.link || '',
            slug: instance.slug || '',
        };
        const refs = [];

        const BASES = this.bases ;

        const prefixes = BASES.map(s => s.toLowerCase());
        const isFromBase = (u = '') =>
            typeof u === 'string' &&
            prefixes.some(p => u.toLowerCase().startsWith(p));
                
        const dom = new JSDOM(html || '');
        const doc = dom.window.document;
        
        const aTags = Array.from(doc.links)
            .filter(n => n.tagName === 'A')
            .map(a => ({
            href: a.getAttribute('href') || '',
            text: (a.textContent || '').replace(/\s+/g, ' ').trim() // normalize whitespace
            }))
            .filter(({ href }) => isFromBase(href));
    
        const imgTags = Array.from(doc.images)
            .map(img => ({
            src: img.getAttribute('src') || '',
            alt: img.getAttribute('alt') || ''
            }))
            .filter(({ src }) => isFromBase(src));
        
        if (aTags.length) {
            refs.push(...aTags.map(({ href, text }) => ({
            linktype: 'a',
            url: href,
            text
            })));
        }
        if (imgTags.length) {
            refs.push(...imgTags.map(({ src, alt }) => ({
            linktype: 'img',
            url: src,
            alt
            })));
        }

        return refs.length ? { ...info, refs } : false;
    }
    
    /**
     * @description convert old links report to CSV format
     * @param {Object} old_links 
     * @returns {String} CSV string
     */
    csvFormat(old_links){
        const fields = ['type', 'id', 'permalink', 'slug', 'linktype', 'url', 'text', 'alt'];
        const opts = { fields, quote: '"' };
        try {
            const parser = new Json2csvParser(opts);
            const csv = parser.parse(old_links);
            return csv;
        } catch (err) {
            console.error(err);
            return '';
        }
    }

    /**
     * @description process links from pages and groups
     */
    async processLinks() {
        const extractedRefs = [];

        for (const p of this.pages ?? []) {
            const html = p?.content?.rendered ?? p?.content?.raw ?? '';
            const info = this.extractRefsInfo(html, p);
            if (info) extractedRefs.push(info);
        }

        for (const g of this.groups ?? []) {
            const html = g?.content?.rendered ?? g?.content?.raw ?? '';
            const info = this.extractRefsInfo(html, g);
            if (info) extractedRefs.push(info);
        }

        this.report = this.flattenRefs(extractedRefs);


        console.log(`Found ${this.report.length} old intranet links in ${this.pages.length} pages and ${this.groups.length} groups.`);
        this.csv = this.csvFormat(this.report);
    }

    /**
     * @description save report to CSV file
     * @returns {void}
    */
    saveReport() {
        const OUTPUT_CSV = path.join(this.dirname, 'old_intranet_links_report.csv');
        writeFile(OUTPUT_CSV, this.csv)
        .then(() => {
            console.log(`Report saved to ${OUTPUT_CSV}`);
        })
        .catch(err => {
            console.error('Error saving report:', err);
        });
    }

    /**
     * @description fetch links from a given URL with Basic Auth
     * @param {String} url 
     * @returns 
     */
    async fetchLinks(url) {
        const all = [];
        let totalPages = 1;
      
        const headers = {
          Accept: "application/json",
          ...(this.auth ? { Authorization: this.auth } : {})
        };
      
        const u = new URL(url);
      
        for (let page = 1; page <= totalPages; page++) {
          u.searchParams.set("page", String(page));
      
          const res = await fetch(u.toString(), { headers });
      
          if (!res.ok) {
            const body = await res.text().catch(() => "");
            throw new Error(`Failed to fetch ${u}: ${res.status} ${res.statusText}\n${body}`);
          }
      
          if (page === 1) {
            totalPages = Number(res.headers.get("X-WP-TotalPages")) || 1;
            console.log(`Fetching ${totalPages} pages from ${url}`);
          }
      
          const data = await res.json();
          if (Array.isArray(data)) all.push(...data);
          else return data; // if not a collection endpoint, return as-is
        }
      
        return all;
      }
      
}
