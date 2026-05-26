const APP = {
  ROOT_PREFIX: 'VanAppiahsite-',
  CONFIG_SHEET: 'Config',
  ADMIN_SHEET: 'AdminConfig',
  COMPANY_SHEET: 'Bedrijfsgegevens',
  PORTFOLIO_SHEET: 'Portfolio',
  PRODUCTS_SHEET: 'Producten',
  MESSAGES_SHEET: 'Berichten',
  QUOTES_SHEET: 'Offertes',
  SUBSCRIBERS_SHEET: 'Mailabonnement',
  PRODUCT_REQUESTS_SHEET: 'ProductAanvragen',
  LEADS_SHEET: 'Leads',
  CLIENTS_SHEET: 'Klanten',
  CACHE_PREFIX: 'vanappiah_admin_',
  PUBLIC_CACHE_VERSION: 'v2',
  ADMIN_TOKEN_TTL: 21600
};

const SHEET_HEADERS = {
  Config: ['key', 'value'],
  AdminConfig: ['username', 'password_hash', 'actief', 'bijgewerkt_op'],
  Bedrijfsgegevens: ['id', 'bedrijfsnaam', 'slogan', 'beschrijving', 'adres', 'telefoonnummer', 'email_1', 'email_2', 'email_3', 'openingstijd_1', 'openingstijd_2', 'openingstijd_3', 'instagram', 'tiktok', 'linkedin', 'website', 'actief'],
  Portfolio: ['id', 'titel', 'slug', 'beschrijving', 'klantnaam', 'categorie', 'mapNaam', 'driveFolderId', 'zichtbaar', 'volgorde', 'aangemaakt_op', 'bijgewerkt_op'],
  Producten: ['id', 'titel', 'slug', 'beschrijving', 'categorie', 'prijs_vanaf', 'onderhoud_eenmalig', 'onderhoud_per_maand', 'onderhoud_uitleg', 'mapNaam', 'driveFolderId', 'zichtbaar', 'volgorde', 'aangemaakt_op', 'bijgewerkt_op'],
  Berichten: ['id', 'voornaam', 'achternaam', 'email', 'telefoonnummer', 'onderwerp', 'bericht', 'status', 'mail_status', 'aangemaakt_op'],
  Offertes: ['id', 'voornaam', 'achternaam', 'bedrijfsnaam', 'adres', 'telefoonnummer', 'email', 'gewenste_dienst', 'budget', 'beschrijving_project', 'status', 'mail_status', 'aangemaakt_op'],
  Mailabonnement: ['id', 'email', 'naam', 'status', 'mail_status', 'aangemeld_op'],
  ProductAanvragen: ['id', 'product_id', 'product_titel', 'voornaam', 'achternaam', 'adres', 'telefoonnummer', 'email', 'bedrijfsnaam', 'extra_informatie', 'status', 'mail_status', 'aangemaakt_op'],
  Leads: ['ID', 'Bedrijfsnaam', 'Contactpersoon', 'Email', 'Telefoonnummer', 'Website', 'ProductInteresse', 'PortfolioVoorbeeld', 'Status', 'TypeMail', 'LaatstGecontacteerd', 'VolgendeActieDatum', 'Notities', 'AangemaaktOp'],
  Klanten: ['ID', 'Klantnaam', 'Bedrijfsnaam', 'Contactpersoon', 'Email', 'Telefoonnummer', 'ProjectType', 'ProjectBeschrijving', 'GedaanWerk', 'WebsiteOfSysteemKostenTotaal', 'BetaaldBedrag', 'NogTeBetalen', 'OnderhoudPerMaand', 'OnderhoudBetaaldTot', 'TikkieLinkDezeMaand', 'BetaalStatus', 'LaatsteUpdateMail', 'Notities', 'AangemaaktOp']
};

function doGet(e) {
  if (e && e.parameter && e.parameter.action) {
    return publicApiGet_(e);
  }
  setupVanAppiahSite();
  const page = e && e.parameter && String(e.parameter.admin || '').toLowerCase() === 'true' ? 'admin' : 'index';
  return renderPage_(page);
}

function doPost(e) {
  try {
    const payload = parsePostPayload_(e);
    return jsonOutput_(apiRequest(payload));
  } catch (err) {
    return jsonOutput_(fail_(err));
  }
}

function apiRequest(payload) {
  try {
    const action = clean_(payload.action);
    const data = payload.data || payload;
    if (isAdminApiAction_(action)) {
      return handleAdminApi_(action, payload.adminCode, data);
    }
    let result;
    if (action === 'submitMessage') result = submitMessage(data);
    else if (action === 'submitQuote') result = submitQuote(data);
    else if (action === 'submitSubscriber') result = submitSubscriber(data);
    else if (action === 'submitProductRequest') result = submitProductRequest(data);
    else throw new Error('Onbekende actie.');
    return result;
  } catch (err) {
    return fail_(err);
  }
}

function setupVanAppiahSite() {
  const ss = getOrCreateSpreadsheet_();
  Object.keys(SHEET_HEADERS).forEach(function (name) {
    ensureSheet(ss, name, SHEET_HEADERS[name]);
  });

  const config = getConfigMap(ss);
  const rootFolder = getOrCreateRootFolder_(config);
  const portfolioFolder = getOrCreateChildFolder_(rootFolder, 'Portfolio');
  const productsFolder = getOrCreateChildFolder_(rootFolder, 'Producten');
  const uploadsFolder = getOrCreateChildFolder_(rootFolder, 'Uploads');

  setConfigValues_(ss, {
    spreadsheet_id: ss.getId(),
    root_folder_id: rootFolder.getId(),
    portfolio_folder_id: portfolioFolder.getId(),
    products_folder_id: productsFolder.getId(),
    uploads_folder_id: uploadsFolder.getId(),
    site_name: 'Van Appiah',
    admin_email: getDefaultAdminEmail_(),
    setup_completed_at: now_()
  });
  PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', ss.getId());

  seedCompany_(ss);
  seedAdmin_(ss);
  seedAdminCode_();
  return { ok: true, message: 'Setup voltooid', config: getConfigMap(ss) };
}

function getSiteData() {
  try {
    setupVanAppiahSite();
    const ss = getSs_();
    const company = getActiveCompany_(ss);
    const portfolio = rowsToObjects_(getSheet_(ss, APP.PORTFOLIO_SHEET))
      .filter(function (item) { return isPublicVisible_(item.zichtbaar); })
      .sort(sortByOrder_)
      .map(function (item) {
        item.images = getPortfolioImages(item.driveFolderId);
        return publicPortfolio_(item);
      });
    const products = rowsToObjects_(getSheet_(ss, APP.PRODUCTS_SHEET))
      .filter(function (item) { return isPublicVisible_(item.zichtbaar); })
      .sort(sortByOrder_)
      .map(function (item) {
        item.images = getProductImages(item.driveFolderId);
        return publicProduct_(item);
      });
    return success_({ bedrijfsgegevens: company, portfolio: portfolio, producten: products });
  } catch (err) {
    return fail_(err);
  }
}

function getFastSiteData(fresh) {
  return cachedPublic_('fast-site-data', fresh, 120, function () {
    const ss = getSs_();
    const company = getActiveCompany_(ss);
    const portfolio = rowsToObjects_(getSheet_(ss, APP.PORTFOLIO_SHEET))
      .filter(function (item) { return isPublicVisible_(item.zichtbaar); })
      .sort(sortByOrder_)
      .map(publicFastPortfolio_);
    const products = rowsToObjects_(getSheet_(ss, APP.PRODUCTS_SHEET))
      .filter(function (item) { return isPublicVisible_(item.zichtbaar); })
      .sort(sortByOrder_)
      .map(publicFastProduct_);

    return success_({
      bedrijfsgegevens: company,
      portfolio: portfolio,
      producten: products,
      generatedAt: now_(),
      imagesLazy: true
    });
  });
}

function getInitialSiteData(params) {
  params = params || {};
  const productsLimit = limitNumber_(params.productsLimit || params.limit || 4, 1, 8);
  const portfolioLimit = limitNumber_(params.portfolioLimit || params.limit || 4, 1, 8);
  const fast = getFastSiteData(params.fresh === '1');
  if (!fast.ok) return fast;
  return success_({
    bedrijfsgegevens: fast.bedrijfsgegevens,
    producten: (fast.producten || []).slice(0, productsLimit),
    portfolio: (fast.portfolio || []).slice(0, portfolioLimit),
    generatedAt: fast.generatedAt,
    imagesLazy: true
  });
}

function getProductsPage(params) {
  params = params || {};
  const offset = Math.max(0, Number(params.offset || 0));
  const limit = limitNumber_(params.limit || 6, 1, 12);
  return cachedPublic_('products:' + offset + ':' + limit, params.fresh === '1', 180, function () {
    const ss = getSs_();
    const products = rowsToObjects_(getSheet_(ss, APP.PRODUCTS_SHEET))
      .filter(function (item) { return isPublicVisible_(item.zichtbaar); })
      .sort(sortByOrder_)
      .map(publicFastProduct_);
    return publicPage_(products, offset, limit);
  });
}

function getPortfolioPage(params) {
  params = params || {};
  const offset = Math.max(0, Number(params.offset || 0));
  const limit = limitNumber_(params.limit || 6, 1, 12);
  return cachedPublic_('portfolio:' + offset + ':' + limit, params.fresh === '1', 180, function () {
    const ss = getSs_();
    const portfolio = rowsToObjects_(getSheet_(ss, APP.PORTFOLIO_SHEET))
      .filter(function (item) { return isPublicVisible_(item.zichtbaar); })
      .sort(sortByOrder_)
      .map(publicFastPortfolio_);
    return publicPage_(portfolio, offset, limit);
  });
}

function getQuoteOptions(params) {
  params = params || {};
  return cachedPublic_('quote-options', params.fresh === '1', 300, function () {
    const ss = getSs_();
    const items = rowsToObjects_(getSheet_(ss, APP.PRODUCTS_SHEET))
      .filter(function (item) { return isPublicVisible_(item.zichtbaar); })
      .sort(sortByOrder_)
      .map(function (item) {
        return {
          id: item.id || item.slug || '',
          titel: item.titel || ''
        };
      })
      .filter(function (item) { return item.titel; });
    return success_({ items: items, generatedAt: now_() });
  });
}

function getProductDetail(params) {
  params = params || {};
  const idOrSlug = params.id || params.slug;
  return cachedPublic_('product-detail:' + idOrSlug, params.fresh === '1', 180, function () {
    const item = getPublicItem_(APP.PRODUCTS_SHEET, idOrSlug, publicFastProduct_);
    return item ? success_({ item: item }) : fail_(new Error('Product niet gevonden.'));
  });
}

function getPortfolioDetail(params) {
  params = params || {};
  const idOrSlug = params.id || params.slug;
  return cachedPublic_('portfolio-detail:' + idOrSlug, params.fresh === '1', 180, function () {
    const item = getPublicItem_(APP.PORTFOLIO_SHEET, idOrSlug, publicFastPortfolio_);
    return item ? success_({ item: item }) : fail_(new Error('Project niet gevonden.'));
  });
}

function getPortfolioImages(folderId) {
  return getDriveImages_(folderId);
}

function getProductImages(folderId) {
  return getDriveImages_(folderId);
}

function getPortfolioImagesPublic(params) {
  params = params || {};
  const folderId = params.folderId || getItemFolderId_(APP.PORTFOLIO_SHEET, params.id || params.slug);
  return success_({ images: getPortfolioImages(folderId) });
}

function getProductImagesPublic(params) {
  params = params || {};
  const folderId = params.folderId || getItemFolderId_(APP.PRODUCTS_SHEET, params.id || params.slug);
  return success_({ images: getProductImages(folderId) });
}

function submitMessage(data) {
  try {
    data = sanitizeObject_(data);
    requireFields_(data, ['voornaam', 'email', 'bericht']);
    assertEmail_(data.email);
    const row = {
      id: uniqueId_('MSG'),
      voornaam: data.voornaam,
      achternaam: data.achternaam,
      email: data.email,
      telefoonnummer: data.telefoonnummer,
      onderwerp: data.onderwerp || 'Bericht via website',
      bericht: data.bericht,
      status: 'Nieuw',
      mail_status: 'pending',
      aangemaakt_op: now_()
    };
    appendObject_(APP.MESSAGES_SHEET, row);
    return success_({ message: 'Bedankt, je bericht is verzonden.' });
  } catch (err) {
    return fail_(err);
  }
}

function submitQuote(data) {
  try {
    data = sanitizeObject_(data);
    requireFields_(data, ['voornaam', 'email', 'gewenste_dienst', 'beschrijving_project']);
    assertEmail_(data.email);
    const row = {
      id: uniqueId_('OFF'),
      voornaam: data.voornaam,
      achternaam: data.achternaam,
      bedrijfsnaam: data.bedrijfsnaam,
      adres: data.adres,
      telefoonnummer: data.telefoonnummer,
      email: data.email,
      gewenste_dienst: data.gewenste_dienst,
      budget: data.budget,
      beschrijving_project: data.beschrijving_project,
      status: 'Nieuw',
      mail_status: 'pending',
      aangemaakt_op: now_()
    };
    appendObject_(APP.QUOTES_SHEET, row);
    return success_({ message: 'Je offerteaanvraag is ontvangen.' });
  } catch (err) {
    return fail_(err);
  }
}

function submitSubscriber(data) {
  try {
    data = sanitizeObject_(data);
    requireFields_(data, ['email']);
    assertEmail_(data.email);
    const row = {
      id: uniqueId_('SUB'),
      email: data.email,
      naam: data.naam,
      status: 'Actief',
      mail_status: 'pending',
      aangemeld_op: now_()
    };
    appendObject_(APP.SUBSCRIBERS_SHEET, row);
    return success_({ message: 'Je bent aangemeld voor updates.' });
  } catch (err) {
    return fail_(err);
  }
}

function submitProductRequest(data) {
  try {
    data = sanitizeObject_(data);
    requireFields_(data, ['product_id', 'product_titel', 'voornaam', 'email']);
    assertEmail_(data.email);
    const row = {
      id: uniqueId_('PRDREQ'),
      product_id: data.product_id,
      product_titel: data.product_titel,
      voornaam: data.voornaam,
      achternaam: data.achternaam,
      adres: data.adres,
      telefoonnummer: data.telefoonnummer,
      email: data.email,
      bedrijfsnaam: data.bedrijfsnaam,
      extra_informatie: data.extra_informatie,
      status: 'Nieuw',
      mail_status: 'pending',
      aangemaakt_op: now_()
    };
    appendObject_(APP.PRODUCT_REQUESTS_SHEET, row);
    return success_({ message: 'Je productaanvraag is ontvangen.' });
  } catch (err) {
    return fail_(err);
  }
}

function processPendingEmails() {
  const ss = getSs_();
  const processed = {
    berichten: processPendingMailRows_(ss, APP.MESSAGES_SHEET, [
      { type: 'message_customer', to: function (row) { return row.email; } },
      { type: 'message_admin', to: function () { return getAdminEmail_(); } }
    ]),
    offertes: processPendingMailRows_(ss, APP.QUOTES_SHEET, [
      { type: 'quote_customer', to: function (row) { return row.email; } },
      { type: 'quote_admin', to: function () { return getAdminEmail_(); } }
    ]),
    abonnementen: processPendingMailRows_(ss, APP.SUBSCRIBERS_SHEET, [
      { type: 'subscriber_welcome', to: function (row) { return row.email; } }
    ]),
    productAanvragen: processPendingMailRows_(ss, APP.PRODUCT_REQUESTS_SHEET, [
      { type: 'product_customer', to: function (row) { return row.email; } },
      { type: 'product_admin', to: function () { return getAdminEmail_(); } }
    ])
  };
  return success_({ message: 'Openstaande e-mails verwerkt.', processed: processed });
}

function processPendingMailRows_(ss, sheetName, mailers) {
  const sheet = getSheet_(ss, sheetName);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(String);
  const mailIndex = headers.indexOf('mail_status');
  if (mailIndex === -1) return 0;
  const values = sheet.getDataRange().getValues();
  let count = 0;
  for (let i = 1; i < values.length; i++) {
    const status = String(values[i][mailIndex] || '').toLowerCase();
    if (status && status !== 'pending') continue;
    const row = {};
    headers.forEach(function (header, index) { row[header] = values[i][index]; });
    try {
      mailers.forEach(function (mailer) {
        sendMail_(mailer.type, mailer.to(row), row);
      });
      sheet.getRange(i + 1, mailIndex + 1).setValue('sent');
      count++;
    } catch (err) {
      sheet.getRange(i + 1, mailIndex + 1).setValue('error');
    }
  }
  return count;
}

function adminLogin(username, password) {
  try {
    setupVanAppiahSite();
    username = clean_(username);
    password = String(password || '');
    if (!username || !password) throw new Error('Vul gebruikersnaam en wachtwoord in.');
    const admins = rowsToObjects_(getSheet_(getSs_(), APP.ADMIN_SHEET));
    const hash = sha256_(password);
    const match = admins.find(function (admin) {
      return truthy_(admin.actief) && admin.username === username && admin.password_hash === hash;
    });
    if (!match) throw new Error('Login mislukt.');
    const token = uniqueId_('ADM') + Utilities.getUuid().replace(/-/g, '');
    CacheService.getScriptCache().put(APP.CACHE_PREFIX + token, username, APP.ADMIN_TOKEN_TTL);
    return success_({ token: token, username: username });
  } catch (err) {
    return fail_(err);
  }
}

function adminGetData(token) {
  try {
    assertAdmin_(token);
    setupVanAppiahSite();
    const ss = getSs_();
    const config = getConfigMap(ss);
    return success_({
      config: safeAdminConfig_(config),
      bedrijfsgegevens: rowsToObjects_(getSheet_(ss, APP.COMPANY_SHEET)),
      portfolio: rowsToObjects_(getSheet_(ss, APP.PORTFOLIO_SHEET)).sort(sortByOrder_),
      producten: rowsToObjects_(getSheet_(ss, APP.PRODUCTS_SHEET)).sort(sortByOrder_),
      berichten: rowsToObjects_(getSheet_(ss, APP.MESSAGES_SHEET)).reverse(),
      offertes: rowsToObjects_(getSheet_(ss, APP.QUOTES_SHEET)).reverse(),
      productAanvragen: rowsToObjects_(getSheet_(ss, APP.PRODUCT_REQUESTS_SHEET)).reverse(),
      mailabonnement: rowsToObjects_(getSheet_(ss, APP.SUBSCRIBERS_SHEET)).reverse(),
      leads: rowsToObjects_(getSheet_(ss, APP.LEADS_SHEET)).reverse(),
      klanten: rowsToObjects_(getSheet_(ss, APP.CLIENTS_SHEET)).reverse()
    });
  } catch (err) {
    return fail_(err);
  }
}

function adminSaveCompany(data) {
  try {
    assertAdmin_(data && data.__token);
    data = sanitizeObject_(data);
    const ss = getSs_();
    const sheet = getSheet_(ss, APP.COMPANY_SHEET);
    const row = {};
    SHEET_HEADERS[APP.COMPANY_SHEET].forEach(function (key) { row[key] = data[key] || ''; });
    row.id = data.id || uniqueId_('CMP');
    row.actief = data.actief === false ? false : true;
    upsertObject_(sheet, row.id, row);
    return success_({ message: 'Bedrijfsgegevens opgeslagen.' });
  } catch (err) {
    return fail_(err);
  }
}

function adminCreatePortfolio(data) {
  try {
    assertAdmin_(data && data.__token);
    data = sanitizeObject_(data);
    requireFields_(data, ['titel']);
    const config = getConfigMap(getSs_());
    const parent = DriveApp.getFolderById(config.portfolio_folder_id);
    const folder = getOrCreateChildFolder_(parent, data.titel);
    safeShareFolder_(folder);
    const now = now_();
    const row = {
      id: uniqueId_('POR'),
      titel: data.titel,
      slug: slugify_(data.slug || data.titel),
      beschrijving: data.beschrijving,
      klantnaam: data.klantnaam,
      categorie: data.categorie,
      mapNaam: folder.getName(),
      driveFolderId: folder.getId(),
      zichtbaar: data.zichtbaar === false ? false : true,
      volgorde: numberOrBlank_(data.volgorde),
      aangemaakt_op: now,
      bijgewerkt_op: now
    };
    appendObject_(APP.PORTFOLIO_SHEET, row);
    return success_({ message: 'Portfolio item aangemaakt.', item: row, folderUrl: folder.getUrl() });
  } catch (err) {
    return fail_(err);
  }
}

function adminUpdatePortfolio(id, data) {
  try {
    assertAdmin_(data && data.__token);
    data = sanitizeObject_(data);
    const sheet = getSheet_(getSs_(), APP.PORTFOLIO_SHEET);
    const existing = getObjectById_(sheet, id);
    if (!existing) throw new Error('Portfolio item niet gevonden.');
    const row = Object.assign({}, existing, {
      titel: data.titel || existing.titel,
      slug: slugify_(data.slug || data.titel || existing.slug || existing.titel),
      beschrijving: data.beschrijving,
      klantnaam: data.klantnaam,
      categorie: data.categorie,
      zichtbaar: data.zichtbaar === false ? false : true,
      volgorde: numberOrBlank_(data.volgorde),
      bijgewerkt_op: now_()
    });
    upsertObject_(sheet, id, row);
    return success_({ message: 'Portfolio item bijgewerkt.', item: row });
  } catch (err) {
    return fail_(err);
  }
}

function adminCreateProduct(data) {
  try {
    assertAdmin_(data && data.__token);
    data = sanitizeObject_(data);
    requireFields_(data, ['titel']);
    const config = getConfigMap(getSs_());
    const parent = DriveApp.getFolderById(config.products_folder_id);
    const folder = getOrCreateChildFolder_(parent, data.titel);
    safeShareFolder_(folder);
    const now = now_();
    const row = {
      id: uniqueId_('PRD'),
      titel: data.titel,
      slug: slugify_(data.slug || data.titel),
      beschrijving: data.beschrijving,
      categorie: data.categorie,
      prijs_vanaf: data.prijs_vanaf,
      onderhoud_eenmalig: data.onderhoud_eenmalig,
      onderhoud_per_maand: data.onderhoud_per_maand,
      onderhoud_uitleg: data.onderhoud_uitleg || 'Betaal je onderhoud in een keer, dan ben je goedkoper uit. Betaal je per maand, dan betaal je uiteindelijk iets meer.',
      mapNaam: folder.getName(),
      driveFolderId: folder.getId(),
      zichtbaar: data.zichtbaar === false ? false : true,
      volgorde: numberOrBlank_(data.volgorde),
      aangemaakt_op: now,
      bijgewerkt_op: now
    };
    appendObject_(APP.PRODUCTS_SHEET, row);
    return success_({ message: 'Product aangemaakt.', item: row, folderUrl: folder.getUrl() });
  } catch (err) {
    return fail_(err);
  }
}

function adminUpdateProduct(id, data) {
  try {
    assertAdmin_(data && data.__token);
    data = sanitizeObject_(data);
    const sheet = getSheet_(getSs_(), APP.PRODUCTS_SHEET);
    const existing = getObjectById_(sheet, id);
    if (!existing) throw new Error('Product niet gevonden.');
    const row = Object.assign({}, existing, {
      titel: data.titel || existing.titel,
      slug: slugify_(data.slug || data.titel || existing.slug || existing.titel),
      beschrijving: data.beschrijving,
      categorie: data.categorie,
      prijs_vanaf: data.prijs_vanaf,
      onderhoud_eenmalig: data.onderhoud_eenmalig,
      onderhoud_per_maand: data.onderhoud_per_maand,
      onderhoud_uitleg: data.onderhoud_uitleg,
      zichtbaar: data.zichtbaar === false ? false : true,
      volgorde: numberOrBlank_(data.volgorde),
      bijgewerkt_op: now_()
    });
    upsertObject_(sheet, id, row);
    return success_({ message: 'Product bijgewerkt.', item: row });
  } catch (err) {
    return fail_(err);
  }
}

function adminUpdateStatus(sheetName, id, status, token) {
  try {
    assertAdmin_(token);
    sheetName = clean_(sheetName);
    if ([APP.MESSAGES_SHEET, APP.QUOTES_SHEET, APP.PRODUCT_REQUESTS_SHEET, APP.SUBSCRIBERS_SHEET].indexOf(sheetName) === -1) {
      throw new Error('Deze sheet mag niet via status worden aangepast.');
    }
    status = clean_(status);
    if (!status) throw new Error('Status is verplicht.');
    const sheet = getSheet_(getSs_(), sheetName);
    const existing = getObjectById_(sheet, id);
    if (!existing) throw new Error('Rij niet gevonden.');
    existing.status = status;
    upsertObject_(sheet, id, existing);
    return success_({ message: 'Status bijgewerkt.' });
  } catch (err) {
    return fail_(err);
  }
}

function getAdminData(adminCode) {
  assertAdminCode_(adminCode);
  setupVanAppiahSite();
  const ss = getSs_();
  const config = getConfigMap(ss);
  return success_({
    config: safeAdminConfig_(config),
    bedrijfsgegevens: rowsToObjects_(getSheet_(ss, APP.COMPANY_SHEET)),
    portfolio: rowsToObjects_(getSheet_(ss, APP.PORTFOLIO_SHEET)).sort(sortByOrder_),
    producten: rowsToObjects_(getSheet_(ss, APP.PRODUCTS_SHEET)).sort(sortByOrder_),
    leads: rowsToObjects_(getSheet_(ss, APP.LEADS_SHEET)).reverse(),
    klanten: rowsToObjects_(getSheet_(ss, APP.CLIENTS_SHEET)).reverse(),
    berichten: rowsToObjects_(getSheet_(ss, APP.MESSAGES_SHEET)).reverse(),
    offertes: rowsToObjects_(getSheet_(ss, APP.QUOTES_SHEET)).reverse(),
    productAanvragen: rowsToObjects_(getSheet_(ss, APP.PRODUCT_REQUESTS_SHEET)).reverse(),
    mailabonnement: rowsToObjects_(getSheet_(ss, APP.SUBSCRIBERS_SHEET)).reverse()
  });
}

function addLead(data) {
  data = sanitizeObject_(data);
  requireFields_(data, ['Bedrijfsnaam', 'Email']);
  assertEmail_(data.Email);
  const row = normalizeLead_(data);
  row.ID = uniqueId_('LEAD');
  row.AangemaaktOp = now_();
  withLock_(function () { appendObject_(APP.LEADS_SHEET, row); });
  return success_({ message: 'Lead toegevoegd.', item: row });
}

function updateLead(data) {
  data = sanitizeObject_(data);
  requireFields_(data, ['ID', 'Bedrijfsnaam', 'Email']);
  assertEmail_(data.Email);
  const sheet = getSheet_(getSs_(), APP.LEADS_SHEET);
  const existing = getObjectByKey_(sheet, 'ID', data.ID);
  if (!existing) throw new Error('Lead niet gevonden.');
  const row = Object.assign({}, existing, normalizeLead_(data), { ID: existing.ID, AangemaaktOp: existing.AangemaaktOp || now_() });
  withLock_(function () { upsertObjectByKey_(sheet, 'ID', row.ID, row); });
  return success_({ message: 'Lead bijgewerkt.', item: row });
}

function deleteLead(data) {
  data = sanitizeObject_(data);
  requireFields_(data, ['ID']);
  withLock_(function () { deleteObjectByKey_(getSheet_(getSs_(), APP.LEADS_SHEET), 'ID', data.ID); });
  return success_({ message: 'Lead verwijderd.' });
}

function previewLeadEmail(data) {
  data = sanitizeObject_(data);
  const template = buildLeadEmail_(data);
  return success_({ subject: template.subject, body: template.body, htmlBody: brandedHtml_(template.title, template.body) });
}

function sendLeadEmail(data) {
  data = sanitizeObject_(data);
  requireFields_(data, ['ID']);
  const sheet = getSheet_(getSs_(), APP.LEADS_SHEET);
  const existing = getObjectByKey_(sheet, 'ID', data.ID);
  if (!existing) throw new Error('Lead niet gevonden.');
  if (!existing.Email) throw new Error('Lead heeft geen e-mailadres.');
  assertEmail_(existing.Email);
  const template = buildLeadEmail_(existing);
  MailApp.sendEmail({ to: existing.Email, subject: template.subject, htmlBody: brandedHtml_(template.title, template.body), name: 'Van Appiah' });
  existing.LaatstGecontacteerd = now_();
  withLock_(function () { upsertObjectByKey_(sheet, 'ID', existing.ID, existing); });
  return success_({ message: 'Lead mail verzonden.' });
}

function addClient(data) {
  data = sanitizeObject_(data);
  requireFields_(data, ['Klantnaam', 'Email']);
  assertEmail_(data.Email);
  const row = normalizeClient_(data);
  row.ID = uniqueId_('KLT');
  row.AangemaaktOp = now_();
  withLock_(function () { appendObject_(APP.CLIENTS_SHEET, row); });
  return success_({ message: 'Klant toegevoegd.', item: row });
}

function updateClient(data) {
  data = sanitizeObject_(data);
  requireFields_(data, ['ID', 'Klantnaam', 'Email']);
  assertEmail_(data.Email);
  const sheet = getSheet_(getSs_(), APP.CLIENTS_SHEET);
  const existing = getObjectByKey_(sheet, 'ID', data.ID);
  if (!existing) throw new Error('Klant niet gevonden.');
  const row = Object.assign({}, existing, normalizeClient_(data), { ID: existing.ID, AangemaaktOp: existing.AangemaaktOp || now_() });
  withLock_(function () { upsertObjectByKey_(sheet, 'ID', row.ID, row); });
  return success_({ message: 'Klant bijgewerkt.', item: row });
}

function deleteClient(data) {
  data = sanitizeObject_(data);
  requireFields_(data, ['ID']);
  withLock_(function () { deleteObjectByKey_(getSheet_(getSs_(), APP.CLIENTS_SHEET), 'ID', data.ID); });
  return success_({ message: 'Klant verwijderd.' });
}

function sendClientUpdateEmail(data) {
  data = sanitizeObject_(data);
  const client = getClientForMail_(data);
  const body = 'Hallo ' + (client.Klantnaam || client.Contactpersoon || 'daar') + ',\n\n' +
    'Hierbij ontvangt u een update over ' + (client.ProjectType || 'uw project') + ' voor ' + (client.Bedrijfsnaam || 'uw bedrijf') + '.\n\n' +
    'Project: ' + (client.ProjectBeschrijving || '-') + '\n\n' +
    'Gedaan werk:\n' + (client.GedaanWerk || '-') + '\n\n' +
    'Met vriendelijke groet,\nVan Appiah';
  MailApp.sendEmail({ to: client.Email, subject: 'Update van Van Appiah', htmlBody: brandedHtml_('Update van Van Appiah', body), name: 'Van Appiah' });
  client.LaatsteUpdateMail = now_();
  withLock_(function () { upsertObjectByKey_(getSheet_(getSs_(), APP.CLIENTS_SHEET), 'ID', client.ID, client); });
  return success_({ message: 'Update mail verzonden.' });
}

function sendClientPaymentEmail(data) {
  data = sanitizeObject_(data);
  const client = getClientForMail_(data);
  const body = 'Hallo ' + (client.Klantnaam || client.Contactpersoon || 'daar') + ',\n\n' +
    'Hierbij ontvangt u de betaalinformatie voor ' + (client.Bedrijfsnaam || 'uw bedrijf') + '.\n\n' +
    'Nog te betalen: €' + money_(client.NogTeBetalen) + '\n' +
    'Onderhoud per maand: €' + money_(client.OnderhoudPerMaand) + '\n' +
    'Onderhoud betaald tot: ' + (client.OnderhoudBetaaldTot || '-') + '\n\n' +
    'Betaallink:\n' + (client.TikkieLinkDezeMaand || '-') + '\n\n' +
    'Met vriendelijke groet,\nVan Appiah';
  MailApp.sendEmail({ to: client.Email, subject: 'Betaalinformatie - Van Appiah', htmlBody: brandedHtml_('Betaalinformatie', body), name: 'Van Appiah' });
  client.LaatsteUpdateMail = now_();
  withLock_(function () { upsertObjectByKey_(getSheet_(getSs_(), APP.CLIENTS_SHEET), 'ID', client.ID, client); });
  return success_({ message: 'Betaalmail verzonden.' });
}

function saveCompanyByCode_(data) {
  data = sanitizeObject_(data);
  const ss = getSs_();
  const sheet = getSheet_(ss, APP.COMPANY_SHEET);
  const row = {};
  SHEET_HEADERS[APP.COMPANY_SHEET].forEach(function (key) { row[key] = data[key] || ''; });
  row.id = data.id || uniqueId_('CMP');
  row.actief = data.actief === false ? false : true;
  withLock_(function () { upsertObject_(sheet, row.id, row); });
  clearPublicCache_();
  return success_({ message: 'Bedrijfsgegevens opgeslagen.' });
}

function savePortfolioByCode_(data) {
  data = sanitizeObject_(data);
  requireFields_(data, ['titel']);
  const ss = getSs_();
  const sheet = getSheet_(ss, APP.PORTFOLIO_SHEET);
  const now = now_();
  let existing = data.id ? getObjectById_(sheet, data.id) : null;
  if (!existing) {
    const config = getConfigMap(ss);
    const parent = DriveApp.getFolderById(config.portfolio_folder_id);
    const folder = getOrCreateChildFolder_(parent, data.titel);
    safeShareFolder_(folder);
    existing = { id: uniqueId_('POR'), driveFolderId: folder.getId(), mapNaam: folder.getName(), aangemaakt_op: now };
  }
  const row = Object.assign({}, existing, {
    titel: data.titel,
    slug: slugify_(data.slug || data.titel),
    beschrijving: data.beschrijving,
    klantnaam: data.klantnaam,
    categorie: data.categorie,
    zichtbaar: data.zichtbaar === false ? false : true,
    volgorde: numberOrBlank_(data.volgorde),
    bijgewerkt_op: now
  });
  withLock_(function () { upsertObject_(sheet, row.id, row); });
  clearPublicCache_();
  return success_({ message: data.id ? 'Portfolio item bijgewerkt.' : 'Portfolio item aangemaakt.', item: row });
}

function saveProductByCode_(data) {
  data = sanitizeObject_(data);
  requireFields_(data, ['titel']);
  const ss = getSs_();
  const sheet = getSheet_(ss, APP.PRODUCTS_SHEET);
  const now = now_();
  let existing = data.id ? getObjectById_(sheet, data.id) : null;
  if (!existing) {
    const config = getConfigMap(ss);
    const parent = DriveApp.getFolderById(config.products_folder_id);
    const folder = getOrCreateChildFolder_(parent, data.titel);
    safeShareFolder_(folder);
    existing = { id: uniqueId_('PRD'), driveFolderId: folder.getId(), mapNaam: folder.getName(), aangemaakt_op: now };
  }
  const row = Object.assign({}, existing, {
    titel: data.titel,
    slug: slugify_(data.slug || data.titel),
    beschrijving: data.beschrijving,
    categorie: data.categorie,
    prijs_vanaf: data.prijs_vanaf,
    onderhoud_eenmalig: data.onderhoud_eenmalig,
    onderhoud_per_maand: data.onderhoud_per_maand,
    onderhoud_uitleg: data.onderhoud_uitleg,
    zichtbaar: data.zichtbaar === false ? false : true,
    volgorde: numberOrBlank_(data.volgorde),
    bijgewerkt_op: now
  });
  withLock_(function () { upsertObject_(sheet, row.id, row); });
  clearPublicCache_();
  return success_({ message: data.id ? 'Product bijgewerkt.' : 'Product aangemaakt.', item: row });
}

function addQuoteByCode_(data) {
  data = sanitizeObject_(data);
  requireFields_(data, ['voornaam', 'email', 'gewenste_dienst']);
  assertEmail_(data.email);
  const row = {
    id: uniqueId_('OFF'),
    voornaam: data.voornaam,
    achternaam: data.achternaam,
    bedrijfsnaam: data.bedrijfsnaam,
    adres: data.adres,
    telefoonnummer: data.telefoonnummer,
    email: data.email,
    gewenste_dienst: data.gewenste_dienst,
    budget: data.budget,
    beschrijving_project: data.beschrijving_project,
    status: data.status || 'Nieuw',
    mail_status: 'pending',
    aangemaakt_op: now_()
  };
  withLock_(function () { appendObject_(APP.QUOTES_SHEET, row); });
  return success_({ message: 'Offerte handmatig toegevoegd.', item: row });
}

function addSubscriberByCode_(data) {
  data = sanitizeObject_(data);
  requireFields_(data, ['email']);
  assertEmail_(data.email);
  const row = {
    id: uniqueId_('SUB'),
    email: data.email,
    naam: data.naam,
    status: data.status || 'Actief',
    mail_status: truthy_(data.stuur_welkomstmail) ? 'sent' : 'pending',
    aangemeld_op: now_()
  };
  withLock_(function () { appendObject_(APP.SUBSCRIBERS_SHEET, row); });
  if (truthy_(data.stuur_welkomstmail)) sendMail_('subscriber_welcome', row.email, row);
  return success_({ message: 'Mail abonnement toegevoegd.', item: row });
}

function ensureMediaFoldersByCode_() {
  const ss = getSs_();
  const config = getConfigMap(ss);
  const portfolioParent = DriveApp.getFolderById(config.portfolio_folder_id);
  const productParent = DriveApp.getFolderById(config.products_folder_id);
  let portfolioMade = 0;
  let productMade = 0;

  withLock_(function () {
    const portfolioSheet = getSheet_(ss, APP.PORTFOLIO_SHEET);
    rowsToObjects_(portfolioSheet).forEach(function (item) {
      if (item.driveFolderId && folderExists_(item.driveFolderId)) return;
      const folder = getOrCreateChildFolder_(portfolioParent, item.titel || item.mapNaam || item.id);
      safeShareFolder_(folder);
      item.driveFolderId = folder.getId();
      item.mapNaam = folder.getName();
      item.bijgewerkt_op = now_();
      upsertObject_(portfolioSheet, item.id, item);
      portfolioMade++;
    });

    const productSheet = getSheet_(ss, APP.PRODUCTS_SHEET);
    rowsToObjects_(productSheet).forEach(function (item) {
      if (item.driveFolderId && folderExists_(item.driveFolderId)) return;
      const folder = getOrCreateChildFolder_(productParent, item.titel || item.mapNaam || item.id);
      safeShareFolder_(folder);
      item.driveFolderId = folder.getId();
      item.mapNaam = folder.getName();
      item.bijgewerkt_op = now_();
      upsertObject_(productSheet, item.id, item);
      productMade++;
    });
  });

  return success_({ message: 'Mappen gecontroleerd. Portfolio: ' + portfolioMade + ' aangemaakt, producten: ' + productMade + ' aangemaakt.' });
}

function updateStatusByCode_(data) {
  data = sanitizeObject_(data);
  requireFields_(data, ['sheetName', 'id', 'status']);
  const allowed = [APP.MESSAGES_SHEET, APP.QUOTES_SHEET, APP.PRODUCT_REQUESTS_SHEET, APP.SUBSCRIBERS_SHEET];
  if (allowed.indexOf(data.sheetName) === -1) throw new Error('Deze status mag niet worden aangepast.');
  const sheet = getSheet_(getSs_(), data.sheetName);
  const existing = getObjectById_(sheet, data.id);
  if (!existing) throw new Error('Rij niet gevonden.');
  existing.status = data.status;
  withLock_(function () { upsertObject_(sheet, data.id, existing); });
  return success_({ message: 'Status bijgewerkt.' });
}

function ensureSheet(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  headers.forEach(function (header, index) {
    const lastColumn = sheet.getLastColumn() || 1;
    const current = sheet.getRange(1, 1, 1, Math.max(lastColumn, 1)).getValues()[0].map(String);
    if (current.indexOf(header) !== -1) return;
    const insertAt = Math.min(index + 1, lastColumn + 1);
    if (insertAt <= lastColumn) sheet.insertColumnBefore(insertAt);
    else sheet.insertColumnAfter(lastColumn);
    sheet.getRange(1, insertAt).setValue(header);
  });
  const current = sheet.getRange(1, 1, 1, Math.max(headers.length, sheet.getLastColumn() || 1)).getValues()[0];
  const same = headers.every(function (header, index) { return current[index] === header; });
  if (!same) sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, headers.length);
  return sheet;
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function renderPage_(page) {
  try {
    return HtmlService.createTemplateFromFile(page)
      .evaluate()
      .setTitle(page === 'admin' ? 'Van Appiah Admin' : 'Van Appiah')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  } catch (err) {
    const url = ScriptApp.getService().getUrl() || '';
    const title = page === 'admin' ? 'Van Appiah Admin' : 'Van Appiah';
    const body = '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + title + '</title></head>' +
      '<body style="font-family:Arial,sans-serif;padding:32px;line-height:1.5;">' +
      '<h1>' + title + '</h1>' +
      '<p>De backend werkt. Maak in Apps Script een HTML-bestand met naam <strong>' + page + '</strong> om deze pagina te tonen.</p>' +
      '<p><a href="' + url + '?action=health">Test health</a></p>' +
      '<p><a href="' + url + '?action=getSiteData">Test data</a></p>' +
      '</body></html>';
    return HtmlService.createHtmlOutput(body)
      .setTitle(title)
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  }
}

function publicApiGet_(e) {
  const action = clean_(e.parameter.action);
  if (isAdminApiAction_(action)) {
    try {
      setupVanAppiahSite();
      const data = e.parameter.data ? JSON.parse(e.parameter.data) : {};
      return jsonOrJsonp_(handleAdminApi_(action, e.parameter.adminCode, data), e.parameter.callback);
    } catch (err) {
      return jsonOrJsonp_(fail_(err), e.parameter.callback);
    }
  }
  if (action === 'health') return jsonOrJsonp_(healthCheck_(), e.parameter.callback);
  if (action === 'getFastSiteData') return jsonOrJsonp_(getFastSiteData(e.parameter.fresh === '1'), e.parameter.callback);
  if (action === 'getInitialSiteData') return jsonOrJsonp_(getInitialSiteData(e.parameter), e.parameter.callback);
  if (action === 'getProductsPage') return jsonOrJsonp_(getProductsPage(e.parameter), e.parameter.callback);
  if (action === 'getPortfolioPage') return jsonOrJsonp_(getPortfolioPage(e.parameter), e.parameter.callback);
  if (action === 'getQuoteOptions') return jsonOrJsonp_(getQuoteOptions(e.parameter), e.parameter.callback);
  if (action === 'getProductDetail') return jsonOrJsonp_(getProductDetail(e.parameter), e.parameter.callback);
  if (action === 'getPortfolioDetail') return jsonOrJsonp_(getPortfolioDetail(e.parameter), e.parameter.callback);
  if (action === 'getPortfolioImages') return jsonOrJsonp_(getPortfolioImagesPublic(e.parameter), e.parameter.callback);
  if (action === 'getProductImages') return jsonOrJsonp_(getProductImagesPublic(e.parameter), e.parameter.callback);
  if (action === 'getSiteData') return jsonOrJsonp_(getSiteData(), e.parameter.callback);
  return jsonOrJsonp_(fail_(new Error('Onbekende publieke actie.')), e.parameter.callback);
}

function healthCheck_() {
  try {
    const ss = getSs_();
    const config = getConfigMap(ss);
    return success_({
      message: 'Webapp bereikbaar',
      spreadsheetId: ss.getId(),
      configuredSpreadsheetId: config.spreadsheet_id || '',
      hasCompanySheet: Boolean(ss.getSheetByName(APP.COMPANY_SHEET))
    });
  } catch (err) {
    return fail_(err);
  }
}

function parsePostPayload_(e) {
  if (e && e.postData && e.postData.contents) {
    try { return JSON.parse(e.postData.contents); } catch (err) {}
  }
  const params = Object.assign({}, e && e.parameter ? e.parameter : {});
  if (params.data) {
    try {
      params.data = JSON.parse(params.data);
    } catch (err) {}
  }
  return params;
}

function jsonOutput_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function jsonOrJsonp_(data, callback) {
  callback = String(callback || '').replace(/[^\w.$]/g, '');
  if (callback) {
    return ContentService.createTextOutput(callback + '(' + JSON.stringify(data) + ');').setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return jsonOutput_(data);
}

function isAdminApiAction_(action) {
  return [
    'getAdminData', 'addLead', 'updateLead', 'deleteLead', 'previewLeadEmail', 'sendLeadEmail',
    'addClient', 'updateClient', 'deleteClient', 'sendClientUpdateEmail', 'sendClientPaymentEmail',
    'setup', 'saveCompany', 'addPortfolio', 'updatePortfolio', 'addProduct', 'updateProduct', 'addQuote', 'addSubscriber', 'updateStatus', 'ensureMediaFolders'
  ].indexOf(action) !== -1;
}

function handleAdminApi_(action, adminCode, data) {
  assertAdminCode_(adminCode);
  if (action === 'getAdminData') return getAdminData(adminCode);
  if (action === 'addLead') return addLead(data);
  if (action === 'updateLead') return updateLead(data);
  if (action === 'deleteLead') return deleteLead(data);
  if (action === 'previewLeadEmail') return previewLeadEmail(data);
  if (action === 'sendLeadEmail') return sendLeadEmail(data);
  if (action === 'addClient') return addClient(data);
  if (action === 'updateClient') return updateClient(data);
  if (action === 'deleteClient') return deleteClient(data);
  if (action === 'sendClientUpdateEmail') return sendClientUpdateEmail(data);
  if (action === 'sendClientPaymentEmail') return sendClientPaymentEmail(data);
  if (action === 'setup') return setupVanAppiahSite();
  if (action === 'saveCompany') return saveCompanyByCode_(data);
  if (action === 'addPortfolio') return savePortfolioByCode_(data);
  if (action === 'updatePortfolio') return savePortfolioByCode_(data);
  if (action === 'addProduct') return saveProductByCode_(data);
  if (action === 'updateProduct') return saveProductByCode_(data);
  if (action === 'addQuote') return addQuoteByCode_(data);
  if (action === 'addSubscriber') return addSubscriberByCode_(data);
  if (action === 'updateStatus') return updateStatusByCode_(data);
  if (action === 'ensureMediaFolders') return ensureMediaFoldersByCode_();
  throw new Error('Onbekende admin actie.');
}

function assertAdminCode_(adminCode) {
  const saved = PropertiesService.getScriptProperties().getProperty('ADMIN_CODE');
  if (!saved) throw new Error('ADMIN_CODE ontbreekt in Script Properties.');
  if (String(adminCode || '') !== saved) throw new Error('Ongeldige admin code.');
}

function getSs_() {
  return getOrCreateSpreadsheet_();
}

function getOrCreateSpreadsheet_() {
  const active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) {
    PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', active.getId());
    return active;
  }

  const props = PropertiesService.getScriptProperties();
  const savedId = props.getProperty('SPREADSHEET_ID') || props.getProperty('spreadsheet_id');
  if (savedId) {
    try {
      return SpreadsheetApp.openById(savedId);
    } catch (err) {}
  }

  const created = SpreadsheetApp.create('Van Appiah Website Database');
  props.setProperty('SPREADSHEET_ID', created.getId());
  return created;
}

function getSheet_(ss, name) {
  const sheet = ss.getSheetByName(name);
  if (!sheet) throw new Error('Sheet ontbreekt: ' + name);
  return sheet;
}

function getConfigMap(ss) {
  const sheet = getSheet_(ss, APP.CONFIG_SHEET);
  const values = sheet.getDataRange().getValues();
  const map = {};
  for (let i = 1; i < values.length; i++) {
    if (values[i][0]) map[String(values[i][0])] = values[i][1];
  }
  return map;
}

function setConfigValues_(ss, values) {
  const sheet = getSheet_(ss, APP.CONFIG_SHEET);
  const existing = getConfigMap(ss);
  Object.keys(values).forEach(function (key) { existing[key] = values[key]; });
  const rows = Object.keys(existing).sort().map(function (key) { return [key, existing[key]]; });
  sheet.clearContents();
  sheet.getRange(1, 1, 1, 2).setValues([SHEET_HEADERS.Config]);
  if (rows.length) sheet.getRange(2, 1, rows.length, 2).setValues(rows);
  sheet.autoResizeColumns(1, 2);
}

function rowsToObjects_(sheet) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = values[0].map(String);
  return values.slice(1).filter(function (row) {
    return row.some(function (value) { return value !== '' && value !== null; });
  }).map(function (row) {
    const obj = {};
    headers.forEach(function (header, index) { obj[header] = row[index]; });
    return obj;
  });
}

function appendObject_(sheetName, obj) {
  const sheet = getSheet_(getSs_(), sheetName);
  const headers = SHEET_HEADERS[sheetName];
  sheet.appendRow(headers.map(function (header) { return obj[header] === undefined ? '' : obj[header]; }));
}

function upsertObject_(sheet, id, obj) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const values = sheet.getDataRange().getValues();
  const idIndex = headers.indexOf('id');
  let rowNumber = -1;
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][idIndex]) === String(id)) rowNumber = i + 1;
  }
  const row = headers.map(function (header) { return obj[header] === undefined ? '' : obj[header]; });
  if (rowNumber > -1) sheet.getRange(rowNumber, 1, 1, headers.length).setValues([row]);
  else sheet.appendRow(row);
}

function getObjectById_(sheet, id) {
  return rowsToObjects_(sheet).find(function (row) { return String(row.id) === String(id); });
}

function getObjectByKey_(sheet, key, value) {
  return rowsToObjects_(sheet).find(function (row) { return String(row[key]) === String(value); });
}

function upsertObjectByKey_(sheet, key, value, obj) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const values = sheet.getDataRange().getValues();
  const keyIndex = headers.indexOf(key);
  if (keyIndex === -1) throw new Error('Kolom ontbreekt: ' + key);
  let rowNumber = -1;
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][keyIndex]) === String(value)) rowNumber = i + 1;
  }
  const row = headers.map(function (header) { return obj[header] === undefined ? '' : obj[header]; });
  if (rowNumber > -1) sheet.getRange(rowNumber, 1, 1, headers.length).setValues([row]);
  else sheet.appendRow(row);
}

function deleteObjectByKey_(sheet, key, value) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const values = sheet.getDataRange().getValues();
  const keyIndex = headers.indexOf(key);
  if (keyIndex === -1) throw new Error('Kolom ontbreekt: ' + key);
  for (let i = values.length - 1; i >= 1; i--) {
    if (String(values[i][keyIndex]) === String(value)) {
      sheet.deleteRow(i + 1);
      return;
    }
  }
  throw new Error('Rij niet gevonden.');
}

function withLock_(callback) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    return callback();
  } finally {
    lock.releaseLock();
  }
}

function getOrCreateRootFolder_(config) {
  if (config.root_folder_id) {
    try { return DriveApp.getFolderById(config.root_folder_id); } catch (err) {}
  }
  const folder = DriveApp.createFolder(APP.ROOT_PREFIX + randomCode_(5));
  safeShareFolder_(folder);
  return folder;
}

function getOrCreateChildFolder_(parent, name) {
  const cleanName = cleanFileName_(name);
  const folders = parent.getFoldersByName(cleanName);
  if (folders.hasNext()) return folders.next();
  return parent.createFolder(cleanName);
}

function folderExists_(folderId) {
  try {
    DriveApp.getFolderById(folderId);
    return true;
  } catch (err) {
    return false;
  }
}

function getDriveImages_(folderId) {
  if (!folderId) return [];
  try {
    const folder = DriveApp.getFolderById(folderId);
    const files = folder.getFiles();
    const images = [];
    while (files.hasNext()) {
      const file = files.next();
      if (!String(file.getMimeType()).match(/^image\//)) continue;
      safeShareFile_(file);
      images.push({
        id: file.getId(),
        name: file.getName(),
        url: 'https://drive.google.com/uc?export=view&id=' + file.getId(),
        thumbnail: 'https://drive.google.com/thumbnail?id=' + file.getId() + '&sz=w900',
        viewUrl: file.getUrl()
      });
    }
    return images;
  } catch (err) {
    return [];
  }
}

function seedCompany_(ss) {
  const sheet = getSheet_(ss, APP.COMPANY_SHEET);
  if (sheet.getLastRow() > 1) return;
  sheet.appendRow([
    uniqueId_('CMP'), 'Van Appiah', 'Digitale oplossingen met een luxe zakelijke afwerking',
    'Van Appiah helpt ondernemers met websites, showcases, automatisering en digitale groei.',
    '', '', getDefaultAdminEmail_(), '', '', 'Ma-vr op afspraak', '', '', '', '', '', '', true
  ]);
}

function seedAdmin_(ss) {
  const sheet = getSheet_(ss, APP.ADMIN_SHEET);
  if (sheet.getLastRow() > 1) return;
  sheet.appendRow(['admin', sha256_('verander-mij'), true, now_()]);
}

function seedAdminCode_() {
  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty('ADMIN_CODE')) props.setProperty('ADMIN_CODE', 'verander-mij');
}

function normalizeLead_(data) {
  return {
    ID: data.ID || '',
    Bedrijfsnaam: data.Bedrijfsnaam,
    Contactpersoon: data.Contactpersoon,
    Email: data.Email,
    Telefoonnummer: data.Telefoonnummer,
    Website: data.Website,
    ProductInteresse: data.ProductInteresse,
    PortfolioVoorbeeld: data.PortfolioVoorbeeld,
    Status: data.Status || 'Nog niet gesproken',
    TypeMail: data.TypeMail || 'A',
    LaatstGecontacteerd: data.LaatstGecontacteerd,
    VolgendeActieDatum: data.VolgendeActieDatum,
    Notities: data.Notities,
    AangemaaktOp: data.AangemaaktOp || ''
  };
}

function normalizeClient_(data) {
  const total = moneyNumber_(data.WebsiteOfSysteemKostenTotaal);
  const paid = moneyNumber_(data.BetaaldBedrag);
  return {
    ID: data.ID || '',
    Klantnaam: data.Klantnaam,
    Bedrijfsnaam: data.Bedrijfsnaam,
    Contactpersoon: data.Contactpersoon,
    Email: data.Email,
    Telefoonnummer: data.Telefoonnummer,
    ProjectType: data.ProjectType,
    ProjectBeschrijving: data.ProjectBeschrijving,
    GedaanWerk: data.GedaanWerk,
    WebsiteOfSysteemKostenTotaal: total,
    BetaaldBedrag: paid,
    NogTeBetalen: Math.max(total - paid, 0),
    OnderhoudPerMaand: moneyNumber_(data.OnderhoudPerMaand),
    OnderhoudBetaaldTot: data.OnderhoudBetaaldTot,
    TikkieLinkDezeMaand: data.TikkieLinkDezeMaand,
    BetaalStatus: data.BetaalStatus || statusFromPayment_(total, paid),
    LaatsteUpdateMail: data.LaatsteUpdateMail,
    Notities: data.Notities,
    AangemaaktOp: data.AangemaaktOp || ''
  };
}

function buildLeadEmail_(lead) {
  const bedrijf = lead.Bedrijfsnaam || 'daar';
  const contact = lead.Contactpersoon ? ' ' + lead.Contactpersoon : '';
  const product = lead.ProductInteresse || 'digitale oplossing';
  const portfolio = lead.PortfolioVoorbeeld || 'eerdere projecten';
  const isFollowUp = String(lead.TypeMail || 'A').toUpperCase() === 'B';
  if (isFollowUp) {
    return {
      subject: 'Opvolging namens Van Appiah',
      title: 'Opvolging namens Van Appiah',
      body: 'Hallo ' + bedrijf + contact + ',\n\n' +
        'Bedankt dat we de mogelijkheid hebben gekregen om kort met u te spreken.\n\n' +
        'Zoals besproken willen wij van Van Appiah u graag helpen met ' + product + '. We hebben al meerdere projecten gemaakt, waaronder ' + portfolio + ', en denken dat dit goed kan aansluiten bij uw bedrijf.\n\n' +
        'Met vriendelijke groet,\nVan Appiah'
    };
  }
  return {
    subject: 'Voorstel namens Van Appiah',
    title: 'Voorstel namens Van Appiah',
    body: 'Hallo ' + bedrijf + ',\n\n' +
      'Wij van Van Appiah willen u graag onze ' + product + ' aanbieden.\n\n' +
      'We hebben al meerdere projecten gemaakt, waaronder ' + portfolio + '. Daarom denken wij dat we ook voor ' + bedrijf + ' iets sterks kunnen neerzetten.\n\n' +
      'Met vriendelijke groet,\nVan Appiah'
  };
}

function getClientForMail_(data) {
  requireFields_(data, ['ID']);
  const client = getObjectByKey_(getSheet_(getSs_(), APP.CLIENTS_SHEET), 'ID', data.ID);
  if (!client) throw new Error('Klant niet gevonden.');
  if (!client.Email) throw new Error('Klant heeft geen e-mailadres.');
  assertEmail_(client.Email);
  return client;
}

function brandedHtml_(title, body) {
  const paragraphs = String(body || '').split('\n').map(function (line) {
    return line ? escapeHtml_(line) : '<br>';
  }).join('<br>');
  return '<div style="margin:0;padding:24px;background:#f6f6f4;font-family:Arial,sans-serif;color:#171717;">' +
    '<div style="max-width:640px;margin:auto;background:#fff;border:1px solid #e7e4dd;">' +
    '<div style="padding:24px;background:#171717;color:#fff;"><div style="font-size:20px;font-weight:700;">Van Appiah</div><div style="color:#c8a75d;margin-top:4px;">Professioneel. Simpel. Gericht.</div></div>' +
    '<div style="padding:24px;"><h2 style="margin:0 0 12px;font-size:22px;">' + escapeHtml_(title) + '</h2><p style="line-height:1.6;margin:0;">' + paragraphs + '</p></div></div></div>';
}

function getActiveCompany_(ss) {
  const row = rowsToObjects_(getSheet_(ss, APP.COMPANY_SHEET)).find(function (item) { return truthy_(item.actief); });
  return row || {};
}

function sendMail_(type, to, data) {
  if (!to) return;
  const template = mailTemplate_(type, data || {});
  MailApp.sendEmail({
    to: to,
    subject: template.subject,
    htmlBody: template.htmlBody,
    name: 'Van Appiah'
  });
}

function mailTemplate_(type, data) {
  const name = clean_(data.voornaam || data.naam || 'daar');
  const product = clean_(data.product_titel || '');
  const rows = Object.keys(data).filter(function (key) {
    return data[key] !== '' && data[key] !== null && data[key] !== undefined && key !== '__token';
  }).map(function (key) {
    return '<tr><td style="padding:6px 10px;border-bottom:1px solid #eee;color:#666;">' + escapeHtml_(key) + '</td><td style="padding:6px 10px;border-bottom:1px solid #eee;">' + escapeHtml_(data[key]) + '</td></tr>';
  }).join('');

  const copy = {
    message_customer: ['Bedankt voor je bericht - Van Appiah', 'Hoi ' + name + ',', 'Bedankt voor je bericht. We hebben je aanvraag ontvangen en nemen zo snel mogelijk contact met je op.'],
    message_admin: ['Nieuw bericht via Van Appiah website', 'Nieuw bericht ontvangen', 'Er is een nieuw bericht binnengekomen via de website.'],
    quote_customer: ['We hebben je offerteaanvraag ontvangen - Van Appiah', 'Hoi ' + name + ',', 'Bedankt voor je offerteaanvraag. We bekijken je project en reageren zo snel mogelijk met een passende vervolgstap.'],
    quote_admin: ['Nieuwe offerteaanvraag via Van Appiah website', 'Nieuwe offerteaanvraag ontvangen', 'Er is een nieuwe offerteaanvraag binnengekomen via de website.'],
    subscriber_welcome: ['Je bent aangemeld voor updates van Van Appiah', 'Hoi ' + name + ',', 'Je bent succesvol aangemeld voor updates van Van Appiah. We sturen alleen relevante berichten.'],
    product_customer: ['We hebben je aanvraag ontvangen - Van Appiah', 'Hoi ' + name + ',', 'Bedankt voor je interesse' + (product ? ' in ' + product : '') + '. We nemen zo snel mogelijk contact met je op.'],
    product_admin: ['Nieuwe productaanvraag via Van Appiah website', 'Nieuwe productaanvraag ontvangen', 'Er is een nieuwe productaanvraag binnengekomen via de website.']
  }[type];

  return {
    subject: copy[0],
    htmlBody: '<div style="margin:0;padding:24px;background:#f6f6f4;font-family:Arial,sans-serif;color:#171717;">' +
      '<div style="max-width:640px;margin:auto;background:#fff;border:1px solid #e7e4dd;">' +
      '<div style="padding:24px;background:#171717;color:#fff;"><div style="font-size:20px;font-weight:700;">Van Appiah</div><div style="color:#c8a75d;margin-top:4px;">Professioneel. Simpel. Gericht.</div></div>' +
      '<div style="padding:24px;"><h2 style="margin:0 0 12px;font-size:22px;">' + escapeHtml_(copy[1]) + '</h2><p style="line-height:1.6;margin:0 0 18px;">' + escapeHtml_(copy[2]) + '</p>' +
      (rows ? '<table style="width:100%;border-collapse:collapse;font-size:14px;">' + rows + '</table>' : '') +
      '<p style="margin:22px 0 0;color:#555;">Met vriendelijke groet,<br>Van Appiah</p></div></div></div>'
  };
}

function assertAdmin_(token) {
  token = String(token || '');
  const username = CacheService.getScriptCache().get(APP.CACHE_PREFIX + token);
  if (!username) throw new Error('Admin sessie verlopen. Log opnieuw in.');
}

function requireFields_(data, fields) {
  fields.forEach(function (field) {
    if (!data[field]) throw new Error('Verplicht veld ontbreekt: ' + field);
  });
}

function assertEmail_(email) {
  if (!String(email || '').match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) throw new Error('Vul een geldig e-mailadres in.');
}

function sanitizeObject_(obj) {
  const out = {};
  Object.keys(obj || {}).forEach(function (key) {
    out[key] = typeof obj[key] === 'boolean' ? obj[key] : clean_(obj[key]);
  });
  return out;
}

function clean_(value) {
  return String(value === undefined || value === null ? '' : value).replace(/[<>]/g, '').trim().slice(0, 5000);
}

function escapeHtml_(value) {
  return String(value === undefined || value === null ? '' : value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function slugify_(value) {
  return clean_(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || uniqueId_('item').toLowerCase();
}

function truthy_(value) {
  return value === true || String(value).toLowerCase() === 'true' || String(value).toLowerCase() === 'ja' || String(value) === '1';
}

function isPublicVisible_(value) {
  const text = String(value === undefined || value === null ? '' : value).toLowerCase().trim();
  return ['false', 'nee', 'no', '0', 'verborgen', 'hidden'].indexOf(text) === -1;
}

function sortByOrder_(a, b) {
  return (Number(a.volgorde) || 9999) - (Number(b.volgorde) || 9999);
}

function numberOrBlank_(value) {
  return value === '' || value === undefined || value === null ? '' : Number(value);
}

function moneyNumber_(value) {
  if (value === '' || value === undefined || value === null) return 0;
  const cleaned = String(value).replace(',', '.').replace(/[^0-9.-]/g, '');
  const num = Number(cleaned);
  return isNaN(num) ? 0 : Math.round(num * 100) / 100;
}

function money_(value) {
  return moneyNumber_(value).toFixed(2).replace('.', ',');
}

function statusFromPayment_(total, paid) {
  if (total > 0 && paid >= total) return 'Betaald';
  if (paid > 0) return 'Deels betaald';
  return 'Open';
}

function uniqueId_(prefix) {
  return prefix + '-' + Utilities.getUuid().split('-')[0].toUpperCase();
}

function randomCode_(length) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let out = '';
  for (let i = 0; i < length; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

function now_() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'Europe/Amsterdam', 'yyyy-MM-dd HH:mm:ss');
}

function sha256_(text) {
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, text, Utilities.Charset.UTF_8);
  return bytes.map(function (b) {
    const v = (b < 0 ? b + 256 : b).toString(16);
    return v.length === 1 ? '0' + v : v;
  }).join('');
}

function getDefaultAdminEmail_() {
  return Session.getActiveUser().getEmail() || '';
}

function getAdminEmail_() {
  const config = getConfigMap(getSs_());
  const company = getActiveCompany_(getSs_());
  return config.admin_email || company.email_1 || getDefaultAdminEmail_();
}

function cleanFileName_(name) {
  return clean_(name).replace(/[\\\/:*?"<>|]/g, '-').slice(0, 120) || 'Map';
}

function safeShareFolder_(folder) {
  try { folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch (err) {}
}

function safeShareFile_(file) {
  try { file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch (err) {}
}

function publicPortfolio_(item) {
  return {
    id: item.id,
    titel: item.titel,
    slug: item.slug,
    beschrijving: item.beschrijving,
    klantnaam: item.klantnaam,
    categorie: item.categorie,
    images: item.images || []
  };
}

function publicFastPortfolio_(item) {
  return {
    id: item.id,
    titel: item.titel,
    slug: item.slug,
    beschrijving: item.beschrijving,
    klantnaam: item.klantnaam,
    categorie: item.categorie,
    driveFolderId: item.driveFolderId || '',
    imageCountReady: false,
    images: []
  };
}

function publicProduct_(item) {
  return {
    id: item.id,
    titel: item.titel,
    slug: item.slug,
    beschrijving: item.beschrijving,
    categorie: item.categorie,
    prijs_vanaf: item.prijs_vanaf,
    onderhoud_eenmalig: item.onderhoud_eenmalig,
    onderhoud_per_maand: item.onderhoud_per_maand,
    onderhoud_uitleg: item.onderhoud_uitleg,
    images: item.images || []
  };
}

function publicFastProduct_(item) {
  return {
    id: item.id,
    titel: item.titel,
    slug: item.slug,
    beschrijving: item.beschrijving,
    categorie: item.categorie,
    prijs_vanaf: item.prijs_vanaf,
    onderhoud_eenmalig: item.onderhoud_eenmalig,
    onderhoud_per_maand: item.onderhoud_per_maand,
    onderhoud_uitleg: item.onderhoud_uitleg,
    driveFolderId: item.driveFolderId || '',
    imageCountReady: false,
    images: []
  };
}

function publicPage_(items, offset, limit) {
  const pageItems = items.slice(offset, offset + limit);
  return success_({
    items: pageItems,
    offset: offset,
    limit: limit,
    total: items.length,
    hasMore: offset + pageItems.length < items.length,
    nextOffset: offset + pageItems.length < items.length ? offset + pageItems.length : ''
  });
}

function cachedPublic_(key, fresh, seconds, producer) {
  const cacheKey = 'public_' + getPublicCacheVersion_() + '_' + key;
  const cache = CacheService.getScriptCache();
  if (!fresh) {
    const cached = cache.get(cacheKey);
    if (cached) {
      try { return JSON.parse(cached); } catch (err) {}
    }
  }

  const data = producer();
  try { cache.put(cacheKey, JSON.stringify(data), seconds || 120); } catch (err) {}
  return data;
}

function clearPublicCache_() {
  PropertiesService.getScriptProperties().setProperty('PUBLIC_CACHE_VERSION', String(Date.now()));
}

function getPublicCacheVersion_() {
  return PropertiesService.getScriptProperties().getProperty('PUBLIC_CACHE_VERSION') || APP.PUBLIC_CACHE_VERSION;
}

function limitNumber_(value, min, max) {
  const num = Number(value);
  if (isNaN(num)) return min;
  return Math.min(max, Math.max(min, Math.floor(num)));
}

function getItemFolderId_(sheetName, idOrSlug) {
  const item = getPublicItem_(sheetName, idOrSlug, function (row) { return row; });
  return item ? item.driveFolderId || '' : '';
}

function getPublicItem_(sheetName, idOrSlug, mapper) {
  const needle = String(idOrSlug || '').trim();
  if (!needle) return null;
  const rows = rowsToObjects_(getSheet_(getSs_(), sheetName));
  const item = rows.filter(function (row) {
    return isPublicVisible_(row.zichtbaar) && (
      String(row.id || '') === needle ||
      String(row.slug || '') === needle ||
      slugify_(row.titel || '') === needle
    );
  })[0];
  return item ? mapper(item) : null;
}

function safeAdminConfig_(config) {
  return {
    spreadsheet_id: config.spreadsheet_id,
    root_folder_id: config.root_folder_id,
    portfolio_folder_id: config.portfolio_folder_id,
    products_folder_id: config.products_folder_id,
    uploads_folder_id: config.uploads_folder_id,
    root_folder_url: config.root_folder_id ? 'https://drive.google.com/drive/folders/' + config.root_folder_id : ''
  };
}

function success_(data) {
  return Object.assign({ ok: true }, data || {});
}

function fail_(err) {
  return { ok: false, message: err && err.message ? err.message : 'Onbekende fout' };
}
