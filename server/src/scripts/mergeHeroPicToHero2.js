const fs = require('fs');
const path = require('path');

/**
 * 将 hero.json 中的 heroPic 按 heroId 映射补充到 hero2.json 的每个英雄对象中
 * - hero.json: heroId(number), heroPic(string)
 * - hero2.json: heroId(string), ...（会新增 heroPic）
 */

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
}

function writeJson(filePath, data) {
  const json = JSON.stringify(data, null, 2) + '\n';
  fs.writeFileSync(filePath, json, 'utf8');
}

function buildHeroPicMap(heroList) {
  return heroList.reduce((map, item) => {
    const heroId = item?.heroId;
    const heroPic = item?.heroPic;
    if (heroId == null || !heroPic) return map;
    map[String(heroId)] = heroPic;
    return map;
  }, {});
}

function main() {
  const modelsDir = path.resolve(__dirname, '../models');
  const heroJsonPath = path.join(modelsDir, 'hero.json');
  const hero2JsonPath = path.join(modelsDir, 'hero2.json');

  const heroList = readJson(heroJsonPath);
  const hero2List = readJson(hero2JsonPath);

  if (!Array.isArray(heroList) || !Array.isArray(hero2List)) {
    throw new Error('hero.json 或 hero2.json 不是数组结构，无法处理');
  }

  const heroPicMap = buildHeroPicMap(heroList);

  let matchedCount = 0;
  let missingCount = 0;

  const merged = hero2List.map((item) => {
    const heroId = item?.heroId;
    const heroPic = heroPicMap[String(heroId)];
    if (heroPic) {
      matchedCount += 1;
      return { ...item, heroPic };
    }
    missingCount += 1;
    return item;
  });

  writeJson(hero2JsonPath, merged);

  console.log('[mergeHeroPicToHero2] done');
  console.log(`[mergeHeroPicToHero2] hero2 total: ${hero2List.length}`);
  console.log(`[mergeHeroPicToHero2] matched: ${matchedCount}`);
  console.log(`[mergeHeroPicToHero2] missing: ${missingCount}`);
}

main();


