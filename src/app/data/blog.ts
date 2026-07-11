/**
 * Blog posts, newest first. Each post body is a short list of typed blocks
 * (heading, paragraph, figure) so the post page renders without a markdown
 * dependency.
 */

export interface BlogBlock {
  kind: 'h2' | 'p' | 'figure'
  text?: string
  src?: string
  alt?: string
  caption?: string
}

export interface BlogPost {
  slug: string
  title: string
  date: string
  summary: string
  tags: string[]
  body: BlogBlock[]
}

const POST_DEFINITIONS: BlogPost[] = [
  {
    slug: 'going-back-to-my-first-data-science-project',
    title: 'Going back to my first data science project',
    date: '2026-07-11',
    summary:
      'Reopening my first real data science project, finding where it went wrong, and redoing it properly: a real trend test on the full record, a couple of broken weather stations, and a warming signal that turns up on every continent.',
    tags: ['Data Science', 'Climate', 'Python'],
    body: [
      {
        kind: 'p',
        text: 'I have been going through old projects lately, cleaning them up, and I kept stalling on the first real project I ever did. There were scrappier class notebooks before it, but this was the first time we picked our own question. It was a graduate class project from the fall of 2021, three of us in an intro course, and the topic was climate change and snowfall. The question was simple and a little personal: Baltimore had not had a real winter in years, and we wanted to know whether the snow was actually going away or whether we were just remembering it wrong.',
      },
      {
        kind: 'p',
        text: 'Reading the notebook again, almost five years later, I could see every seam. What follows is not everything that was wrong with it. It is the handful of things that actually mattered, what I got wrong on each one, and how I did it differently this time.',
      },
      { kind: 'h2', text: 'Mistake one: we never checked our number against a baseline' },
      {
        kind: 'p',
        text: 'The centerpiece of the old project was a decision tree that predicted whether it would snow, and it reported very high accuracy. We were pretty pleased with that. The plan itself was reasonable: train on the whole history we had, then see how it did on new days, the kind of weather that was not in the set. Where it fell down was proving that the number meant anything.',
      },
      {
        kind: 'p',
        text: 'It snows on only about two and a half percent of days at BWI. A lazy model that says "no snow" every single day, forever, is right about ninety seven percent of the time. Any accuracy we reported had to clear that bar to mean something, and ours barely did. We never stood our model next to that do-nothing baseline, so a figure that sounded impressive was, for this particular problem, sitting just above the floor. The out-of-sample testing was shakier than it should have been on top of that, so even setting the baseline aside, we could not really say the thing worked.',
      },
      {
        kind: 'p',
        text: 'The fix is a habit, not a technique: before trusting any result, compare it to the dumbest thing that could possibly work. If your clever model cannot clearly beat "assume it never snows," you do not have a result yet. Everywhere in the redo, a number only counts once I know what "nothing" would have scored.',
      },
      { kind: 'h2', text: 'Mistake two: we chased the amount when the data only knew the day' },
      {
        kind: 'p',
        text: 'We set out to predict how much snow would fall and ended up predicting only whether it would snow at all. At the time that felt like a retreat. It was actually the right move, we just never really understood why. The station data could see a snowy day coming, but it could not tell four inches from twelve, and no amount of modeling was going to pull that resolution out of it. Whether it would snow was in reach. How much was not.',
      },
      {
        kind: 'p',
        text: "It is worth being precise about the inputs, too, because this kind of model is easy to wave off as cheating. Using the snow already on the ground to help predict the next day is fair game: yesterday's snowpack carries real information about tomorrow. That is a feature, not a leak. The mistake was never the inputs. It was not being clear-eyed, at the time, about which question the data could actually answer.",
      },
      {
        kind: 'p',
        text: 'The honest, properly tested version of this model is its own next write-up, and I will build it knowing the difference between predicting the day and predicting the depth.',
      },
      { kind: 'h2', text: 'Mistake three: we answered a question we never actually asked' },
      {
        kind: 'p',
        text: 'The part that bothered me most was not the model. It was that we never answered the question we started with. We looked at some line charts, wrote "we could not see a clear trend," and moved on. "We could not see a trend" is not a finding. It is what you write when you have not looked properly.',
      },
      {
        kind: 'p',
        text: "So this time I stopped eyeballing and tested it. There is a standard tool for this called the Mann-Kendall test, and the idea behind it is intuitive: ignore how big each year's jump is and just ask whether the years mostly march in one direction or whether it looks like a coin flip. Because it only cares about the ordering and not the exact numbers, a few freak winters cannot fool it. To measure how steep the trend is, I used the Theil-Sen slope, which draws the line through the middle of every pair of years so no single wild season can drag it around. Neither is fancy. They are just the right tools for a series as noisy as snowfall.",
      },
      {
        kind: 'p',
        text: "I also gave it far more to work with. Instead of fighting the rate-limited weather API the way we did in 2021, I downloaded NOAA's single file holding the station's entire history, which runs from 1939 to last week, roughly three times the span we had before.",
      },
      {
        kind: 'p',
        text: 'The answer, this time, was clear and more interesting than the one we gave up on.',
      },
      {
        kind: 'figure',
        src: 'assets/blog/bwi-trends.webp',
        alt: 'BWI temperature and snowfall over the full record, each tested for a trend',
        caption: 'BWI temperature and snowfall over the full record, each tested for a trend',
      },
      {
        kind: 'p',
        text: 'The temperature at BWI has genuinely risen: about a tenth of a degree Celsius per decade over the year, faster in winter, which adds up to roughly a full degree across the record. Snowfall, though, has not significantly changed. It drifts down a little, but the swing from one winter to the next is so enormous, from almost nothing to nearly two meters, that no real trend shows through. So the honest version of our hunch is this: the warming is real, but the idea that it has already cut the snow at this one airport is not something eighty seven years of data will support. Warmer, yes. Less snowy, not clearly, not yet.',
      },
      { kind: 'h2', text: 'Mistake four: we never looked at the raw data' },
      {
        kind: 'p',
        text: 'A single airport is a single airport, so I wanted to know whether the warming was just Baltimore or something bigger. I pulled long records from around the world, at least one on each continent, both hemispheres, plus the high Arctic and the South Pole, and ran the same test on each.',
      },
      {
        kind: 'p',
        text: 'Two of my first picks came back as nonsense, and this is the mistake we never even knew we were at risk of in 2021. One station in South Africa showed a dramatic cooling trend, which would have been a great story if it were real.',
      },
      {
        kind: 'figure',
        src: 'assets/blog/east-london-artifact.webp',
        alt: 'East London, South Africa: the annual temperature drops about six degrees almost overnight in the late 1970s, a station move, not weather',
        caption:
          'East London, South Africa: the annual temperature drops about six degrees almost overnight in the late 1970s, a station move, not weather',
      },
      {
        kind: 'p',
        text: 'It was not real. Plotting the raw years showed the temperature dropping about six degrees almost overnight in the late 1970s and then sitting there. That is not weather. That is a station that got moved, or an instrument swapped, with the two halves never stitched together. A second station, in Australia, quietly stopped reporting around 1979, and the software was drawing a straight line across the gap and calling it a trend. Raw station data is not cleaned for this. If I had trusted the numbers instead of looking at the pictures, I would have published a cooling trend that does not exist, which is the same mistake as 2021 wearing a nicer suit. I threw both out, wrote down why, and swapped in stations with continuous records.',
      },
      { kind: 'p', text: 'With clean data, the pattern was not subtle.' },
      {
        kind: 'figure',
        src: 'assets/blog/global-warming.webp',
        alt: 'Annual mean temperature at nine stations on every continent and at both poles, each with its trend line; all nine warm',
        caption:
          'Annual mean temperature at nine stations on every continent and at both poles, each with its trend line; all nine warm',
      },
      {
        kind: 'p',
        text: 'Every single station warmed, and every one cleared the significance bar: Baltimore, Buenos Aires, Oxford, a town in the Algerian Sahara, Windhoek, Tokyo, Sydney, Barrow in the Alaskan Arctic, and the Amundsen-Scott base at the South Pole. Both hemispheres, every continent, both ends of the Earth. The fastest warming by a good margin was the Arctic station, which is exactly what the science has said for years: the poles heat faster than the rest of us.',
      },
      { kind: 'h2', text: 'The thing underneath all four' },
      {
        kind: 'p',
        text: 'Line those mistakes up and they rhyme: an accuracy we never checked against the base rate, a question we asked that the data could not answer, a "no trend" we announced without ever testing it, and a cooling station we never plotted. Each one is the same move, trusting a claim before checking whether the data underneath actually backed it. The fix was never a cleverer algorithm. It was slowing down to get all the data, size the claim against the dumbest baseline, and look at the raw picture before believing any summary. The original project\'s real lesson, buried in its own conclusion, was that most of the work is getting the data honest. It took me five years and a redo to actually take my own advice.',
      },
      {
        kind: 'p',
        text: 'This is the first of these write-ups. The properly built, properly tested snow model is the next one, and I have a longer list of old projects with seams in them. I would rather reopen them than pretend they were finished.',
      },
    ],
  },
]

export const POSTS: BlogPost[] = [...POST_DEFINITIONS].sort((a, b) => b.date.localeCompare(a.date))

export function getPost(slug: string): BlogPost | undefined {
  return POSTS.find((p) => p.slug === slug)
}
