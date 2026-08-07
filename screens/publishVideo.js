import gamingVideos from "../data/videos/gaming.js";

export default function PublishVideo(player){

    let html="";

    let videos=gamingVideos;

    videos.forEach(video=>{

        html+=`

        <div class="videoCard">

            <h2>${video.title}</h2>

            <p>${video.description}</p>

            <small>

                💸 Costo: $${video.cost}

            </small>

            <button class="publishButton"

                data-id="${video.id}">

                Publicar

            </button>

        </div>

        `;

    });

    return`

    <section class="screen fade">

        <div class="card">

            <h1 class="logo">

                Elegí tu próximo video

            </h1>

            ${html}

        </div>

    </section>

    `;

}
