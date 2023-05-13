const { writeFileSync } = require('fs');

const cities = [
  'Aberdeen',
  'Belfast',
  'Birmingham',
  'Bolton',
  'Bournemouth',
  'Bradford',
  'Brighton',
  'Bristol',
  'Chester',
  'Coventry',
  'Crawley',
  'Derby',
  'Doncaster',
  'Dundee',
  'Edinburgh',
  'Exeter',
  'Glasgow',
  'Huddersfield',
  'Kingston upon Hull',
  'Leeds',
  'Leicester',
  'Liverpool',
  'London',
  'Maidstone',
  'Manchester',
  'Milton Keynes',
  'Northampton',
  'Norwich',
  'Nottingham',
  'Oxford',
  'Plymouth',
  'Sheffield',
  'Southampton',
  'Stoke-on-Trent',
  'Swindon',
  'Telford',
  'Watford',
];
const jobPostings = [];
const promises = [];

// Get all jobs in cities
for (let i = 0; i < 100; i++) {
  let promise = getData(searchUrlCreator(i)).then((response) => {
    jobPostings.push(...response.results.filter((job) => job.minimumSalary && cities.includes(job.locationName)));
  });
  promises.push(promise);
}

// Save JSON file when done
Promise.allSettled(promises).then((_) => {
  const lookup = jobPostings.reduce((accumulator, job) => {
    accumulator[job.jobId] = ++accumulator[job.jobId] || 0;
    return accumulator;
  }, {});

  const filteredJobs = jobPostings.filter((job) => lookup[job.jobId]);

  console.log(
    `Found ${jobPostings.length} job postings and removed ${jobPostings.length - filteredJobs.length} duplicates`
  );
  console.log(`Saved ${filteredJobs.length} jobs on ${new Date()}`);
  const json = JSON.stringify(jobPostings);
  writeFileSync('./jobs.json', json);
});

// ---------------------------------------------------------------------------------------------------------------------

/**
 * Essentially node-fetch.
 * @param url String: The endpoint
 * @returns Promise: The data
 */
async function getData(url) {
  try {
    const encodedApiKey = btoa('549B3080-50BC-4FEE-AB78-71B6DB5191B7:');
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${encodedApiKey}`,
      },
    });
    // No await to return as promise
    const json = response.json();
    return json;
  } catch (error) {
    console.error(error);
  }
}

/**
 * Creates the URL for the GET request of the job postings search.
 * @param page Number: 0 indexed.
 * @returns String: The URL.
 */
function searchUrlCreator(page) {
  const keywords = ['software'];
  const initialUrl = `https://www.reed.co.uk/api/1.0/search?keywords=${keywords.join('+')}&fullTime=true`;
  return page ? initialUrl + `&resultsToSkip=${100 * page}` : initialUrl;
}
