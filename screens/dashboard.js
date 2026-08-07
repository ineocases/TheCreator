export default function Dashboard(player){

    return `

    <section class="screen fade">

        <div class="card">

            <h1 class="logo">
                ${player.channel}
            </h1>

            <p class="subtitle">

                Año ${player.year}

            </p>

            <div class="stats">

                <div class="stat">
                    👥
                    <span>${player.subscribers}</span>
                    <small>Suscriptores</small>
                </div>

                <div class="stat">
                    👀
                    <span>${player.views}</span>
                    <small>Vistas</small>
                </div>

                <div class="stat">
                    💵
                    <span>$${player.money}</span>
                    <small>Dinero</small>
                </div>

            </div>

            <button id="publishVideo">

                Publicar Video

            </button>

        </div>

    </section>

    `;

}
