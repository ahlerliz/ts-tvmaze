import axios from "axios"
import * as $ from 'jquery';

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");

const DEFAULT_IMAGE = { medium: "https://tinyurl.com/tv-missing" };
const API_URL = "http://api.tvmaze.com/";

interface SimpleShowInterface {
  id: number;
  name: string;
  summary: string;
  image: ImageInterface | null;
}
interface ShowInterface {
  score: number;
  show: SimpleShowInterface;
}
interface ImageInterface {
  original: string;
  medium: string
}

interface EpisodeInterface {
  id: number;
  name: string;
  season: number;
  number: number;
}

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term: string): Promise<SimpleShowInterface[]> {
  const shows = await axios.get(`${API_URL}search/shows?q=${term}`)
  return shows.data.map((scoreAndShow: ShowInterface) => {
    return {
      id: scoreAndShow.show.id,
      name: scoreAndShow.show.name,
      summary: scoreAndShow.show.summary || "No description provided.",
      image: (scoreAndShow.show.image ? scoreAndShow.show.image.medium: DEFAULT_IMAGE.medium)
    }
  });
}


/** Given list of shows, create markup for each and add to DOM */

function populateShows(shows: SimpleShowInterface[]) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img 
              src="${show.image}" 
              alt="${show.name}" 
              class="w-25 mr-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>  
       </div>
      `
    );

    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val() as string;
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API create markup for each and to DOM */

async function getEpisodesOfShow(id: number): Promise<EpisodeInterface[]> {

  let episodes = await axios.get(`${API_URL}shows/${id}/episodes`);
  return episodes.data.map((episode: EpisodeInterface) => {
    return {
      id: episode.id, 
      name: episode.name,
      season: episode.season,
      number: episode.number
    }
  });
}

/** Given a list of episodes, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

function populateEpisodes(episodes: EpisodeInterface[])  {
  $episodesArea.empty();
  for (let episode of episodes) {
    const $episode = $(
      `<li>${episode.name} (Season: ${episode.season}, Number: ${episode.number})</li>`
    );
    $episodesArea.append($episode);
  }
  $episodesArea.show();
}

/** Handle click on episodes: get episodes from API and display.
 *    Show episodes area
 */

async function getEpisodesAndDisplay(evt: JQuery.ClickEvent){

  let showId: number = $(evt.target).closest('.Show').data("show-id");
  const episodes = await getEpisodesOfShow(showId)
  populateEpisodes(episodes);
  
}

$showsList.on("click", ".Show-getEpisodes", getEpisodesAndDisplay);