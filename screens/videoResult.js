export default function VideoResult(video, result){

    return `

    <section class="screen fade">

        <div class="card">

            <h1 class="logo">

                ${video.title}

            </h1>

            <p class="subtitle">

                ${result.viralText || "El video fue publicado."}

            </p>

            <div class="stats">

                <div class="stat">

                    👀

                    <span>${result.views.toLocaleString()}</span>

                    <small>Vistas</small>

                </div>

                <div class="stat">

                    👥

                    <span>+${result.subscribers}</span>

                    <small>Suscriptores</small>

                </div>

                <div class="stat">

                    💵

                    <span>$${result.money}</span>

                    <small>Ingresos</small>

                </div>

            </div>

            <button id="backDashboard">

                Volver

            </button>

        </div>

    </section>

    `;

}
