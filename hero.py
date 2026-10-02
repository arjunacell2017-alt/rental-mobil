import asyncio, json, os
from playwright.async_api import async_playwright
async def main():
  m=json.load(open(os.path.expanduser("~/.cache/lovable-auth/session.json")))
  async with async_playwright() as pw:
    b=await pw.chromium.launch(headless=True); pg=await (await b.new_context(viewport={"width":1280,"height":1800})).new_page()
    await pg.goto("http://localhost:8080"); await pg.wait_for_timeout(3000)
    await pg.evaluate(f"localStorage.setItem({json.dumps(m['storage_key'])},{json.dumps(json.dumps(m['session']))})")
    for f in ["a.jpg","b.jpg"]:
      await pg.goto("http://localhost:8080/admin/settings", wait_until="commit"); await pg.wait_for_timeout(4000)
      await pg.locator('input[type=file]').first.set_input_files("/tmp/browser/p/"+f)
      await pg.get_by_role("button",name="Simpan Pengaturan").click(); await pg.wait_for_timeout(4000)
      print(f, await pg.locator("[data-sonner-toast]").all_inner_texts())
      await pg.goto("http://localhost:8080/", wait_until="commit"); await pg.wait_for_timeout(4000)
      el=pg.locator('img[alt^="Mobil rental"]'); await el.screenshot(path=f"/tmp/browser/p/hero_{f}.png")
      print(await el.get_attribute("src"))
    await b.close()
asyncio.run(main())
