/* =============================================
   EditorJS JSON → HTML renderer
   Utilisé par article.html et page.html
   Rétro-compatible avec les anciens contenus HTML
   ============================================= */

function renderEditorContent(content) {
  if (!content) return '<p>Contenu non disponible.</p>';

  let data;
  try {
    data = JSON.parse(content);
    if (!data || !Array.isArray(data.blocks)) throw new Error('Not EditorJS');
  } catch {
    // Contenu HTML legacy — rendu direct
    return content;
  }

  return data.blocks.map(renderBlock).filter(Boolean).join('\n');
}

function renderBlock(block) {
  const d = block.data || {};

  switch (block.type) {

    case 'paragraph':
      return `<p>${d.text || ''}</p>`;

    case 'header': {
      const lvl = Math.min(Math.max(d.level || 2, 1), 6);
      return `<h${lvl}>${d.text || ''}</h${lvl}>`;
    }

    case 'list': {
      const tag = d.style === 'ordered' ? 'ol' : 'ul';
      const items = (d.items || []).map(item => `<li>${item}</li>`).join('');
      return `<${tag}>${items}</${tag}>`;
    }

    case 'image':
    case 'simpleImage': {
      const url = d.url || d.src || '';
      if (!url) return '';
      return `<figure class="ejr-figure">
        <img src="${url}" alt="${d.caption || ''}" loading="lazy">
        ${d.caption ? `<figcaption>${d.caption}</figcaption>` : ''}
      </figure>`;
    }

    case 'quote':
      return `<blockquote class="ejr-quote">
        <p>${d.text || ''}</p>
        ${d.caption ? `<cite>${d.caption}</cite>` : ''}
      </blockquote>`;

    case 'delimiter':
      return `<hr class="ejr-delimiter">`;

    case 'table': {
      if (!d.content || !d.content.length) return '';
      const hasHeader = d.withHeadings;
      const rows = d.content.map((row, i) => {
        const tag = (hasHeader && i === 0) ? 'th' : 'td';
        return `<tr>${row.map(cell => `<${tag}>${cell}</${tag}>`).join('')}</tr>`;
      }).join('');
      return `<div class="ejr-table-wrap"><table class="ejr-table">${rows}</table></div>`;
    }

    case 'code':
      return `<pre class="ejr-code"><code>${ejrEsc(d.code || '')}</code></pre>`;

    case 'warning':
      return `<div class="ejr-warning">
        <strong>${d.title || 'Attention'}</strong>
        <p>${d.message || ''}</p>
      </div>`;

    case 'embed': {
      const src = d.embed || '';
      if (!src) return '';
      return `<div class="ejr-embed">
        <iframe src="${src}" frameborder="0" allowfullscreen loading="lazy"></iframe>
        ${d.caption ? `<p class="ejr-embed-caption">${d.caption}</p>` : ''}
      </div>`;
    }

    case 'raw':
      return d.html || '';

    case 'checklist': {
      const items = (d.items || []).map(item =>
        `<li class="ejr-check ${item.checked ? 'ejr-checked' : ''}">
          <span class="ejr-check-icon">${item.checked ? '✓' : '○'}</span>
          <span>${item.text}</span>
        </li>`
      ).join('');
      return `<ul class="ejr-checklist">${items}</ul>`;
    }

    default:
      return '';
  }
}

function ejrEsc(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
