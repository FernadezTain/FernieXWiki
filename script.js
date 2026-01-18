const currentSection = document.querySelector(".current-section");
const postsContainer = document.getElementById("posts-container");

document.querySelectorAll(".side-item").forEach(item => {
  item.addEventListener("click", async () => {
    const section = item.dataset.section;
    currentSection.textContent = section;
    postsContainer.innerHTML = "<p class='hint'>Загрузка...</p>";

    try {
      const res = await fetch(`posts/${section}.json`);
      if (!res.ok) throw new Error("Файл не найден");
      const posts = await res.json();

      if (!posts.length) {
        postsContainer.innerHTML = "<p class='hint'>Пока нет постов</p>";
        return;
      }

      postsContainer.innerHTML = "";
      posts.forEach(post => {
        const div = document.createElement("div");
        div.className = "post";

        const dateStr = post.date ? `<span class="post-date">${post.date}</span>` : "";
        const authorStr = post.author ? `<span class="post-author">от ${post.author}</span>` : "";

        div.innerHTML = `
          ${post.photo ? `<img src="${post.photo}" alt="Фото поста">` : ""}
          <div class="post-text collapsed">${post.text}</div>
          <div class="post-meta">${authorStr} ${dateStr}</div>
        `;

        div.querySelector(".post-text").addEventListener("click", e => {
          e.target.classList.toggle("collapsed");
        });

        postsContainer.appendChild(div);
      });

    } catch (err) {
      postsContainer.innerHTML = "<p class='hint'>Ошибка загрузки постов</p>";
      console.error(err);
    }
  });
});
