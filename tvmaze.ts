import axios from "axios"
import * as $ from 'jquery';

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");

const DEFAULT_IMAGE = {medium: "https://tinyurl.com/tv-missing"};
const API_URL = "http://api.tvmaze.com/";

interface SimpleShowInterface {
  id: number;
  name: string;
  summary: string;
  image: ImageInterface;
}
interface ShowInterface {
  score: number;
  show: SimpleShowInterface;
}
interface ImageInterface {
  original: string;
  medium: string
}

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term: string): Promise<SimpleShowInterface[]> {
  const resp = await axios.get(`${API_URL}search/shows?q=${term}`)
  return resp.data.map((scoreAndShow: ShowInterface) => {
    return {
      id: scoreAndShow.show.id, 
      name: scoreAndShow.show.name, 
      summary: scoreAndShow.show.summary, 
      image: scoreAndShow.show.image.medium || DEFAULT_IMAGE.medium
    }
  });
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows: SimpleShowInterface[]) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
        `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src="http://static.tvmaze.com/uploads/images/medium_portrait/160/401704.jpg"
              alt="Bletchly Circle San Francisco"
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
      `);

    $showsList.append($show);  }
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


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

// async function getEpisodesOfShow(id) { }

/** Write a clear docstring for this function... */

// function populateEpisodes(episodes) { }