import { Button, Frog, TextInput } from 'frog'
import { Box, Heading, Text, Rows, Row, Divider, Image, Columns, Column, vars } from './ui.js'
import { devtools } from 'frog/dev'
import { serveStatic } from 'frog/serve-static'
// import { neynar } from 'frog/hubs'
import { handle } from 'frog/vercel'
import { neynar } from 'frog/middlewares'

const SITE_URL = "https://check-degen-stats.vercel.app/";

export const app = new Frog({
  title: 'Check Degen Start By Dangs',
  assetsPath: '/',
  basePath: '/api',
  ui: { vars },
  // Supply a Hub to enable frame verification.
  hub: {
    apiUrl: "https://hubs.airstack.xyz",
    fetchOptions: {
      headers: {
        "x-airstack-hubs": "17a84df8e7e234976a81f2c6f79f8cdc4",
      }
    }
  }
}).use(
  neynar({
    apiKey: 'NEYNAR_FROG_FM',
    features: ['interactor', 'cast'],
  }),
)

function Content(remaining_allowance:string, tip_allowance:string, user_rank:string, points:string) {
  return <Row paddingLeft="64" height="5/7"> 
          <Columns gap="8" grow> 
            <Column width="1/7" />
            <Column width="4/7"> 
              <Rows gap="8" grow>
                <Row height="1/7" > <Heading size="20"> Tipping Balance</Heading> </Row>
                <Row paddingLeft="12" height="2/7" > 
                  <Columns gap="8" grow> 
                    <Column alignVertical='bottom' width="3/7"> <Text>- Allowance: </Text> </Column>
                    <Column width="4/7"> <Text align='right' color="main" weight="900" size="20"> { tip_allowance ?? 0 } </Text> </Column>
                  </Columns>
                  <Columns gap="8" grow> 
                    <Column alignVertical='bottom' width="3/7"> <Text>- Remaining: </Text> </Column>
                    <Column width="4/7"> <Text color="main" align='right' weight="900" size="20">{ remaining_allowance ?? 0 }</Text> </Column>
                  </Columns>
                </Row>
                <Divider />
                <Row height="1/7" > <Heading size="20"> Other Information </Heading> </Row>
                <Row paddingLeft="12" height="2/7" > 
                  <Columns gap="8" grow> 
                    <Column alignVertical='bottom' width="3/7"> <Text>- Balance: </Text> </Column>
                    <Column width="4/7"> <Text color="main" align='right' weight="900" size="20"> { points ?? 0 } </Text> </Column>
                  </Columns>
                  <Columns gap="8" grow> 
                    <Column alignVertical='bottom' width="5/7"> <Text>- Rank: </Text> </Column>
                    <Column width="2/7"> <Text color="main" align='right' weight="900" size="20">{ user_rank ?? 0 }</Text> </Column>
                  </Columns>
                </Row>
              </Rows>
            </Column>
            <Column width="2/7" />
          </Columns>
        </Row>;
}

function MakeID(length:number) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

app.frame('/', async (c) => {
  console.log(1);
  
  const { frameData } = c
  const { fid } = frameData || {} 

  var { displayName, username, pfpUrl } = c.var.interactor || {};

  var degenBalance = await fetch("https://www.degentip.me/api/get_allowance?fid="+fid ,{ method:"GET" });
  var { allowance } = JSON.parse(await degenBalance.text()) || {};
  var { remaining_allowance, tip_allowance, user_rank, wallet_addresses } = allowance || {};

  if (typeof wallet_addresses != "undefined") {
    var rankBalance = await fetch("https://api.degen.tips/airdrop2/current/points?wallet="+wallet_addresses[0] ,{ method:"GET" });
    var { points } = JSON.parse(await rankBalance.text())[0] || {};
  } else {
    points = "0";
  }

  const ids = MakeID(7);
  const uriShare = encodeURI(`https://warpcast.com/~/compose?text=Check your $DEGEN Stats. Frame by @dangs.eth &embeds[]=${SITE_URL}api/${fid}/dangs${ids}`);

  return c.res({
    imageOptions: {
      height: 426,
      width: 816,
    },
    image: (
      <Box height="100%" width="100%" backgroundSize="816px 426px" backgroundRepeat='no-repeat' backgroundImage={`url("${SITE_URL}/bg.png")`}> 

        <Rows paddingTop="12" paddingRight="12" paddingLeft="12" paddingBottom="0" gap="8" grow>
          <Row height="2/7" >
            { typeof displayName != "undefined" ? 
            <Columns gap="8" grow> 
              <Column width="1/7"> 
                <Image width="72" height="100%"borderRadius="192" objectFit='cover' src={pfpUrl || ""} />
              </Column>
              <Column alignVertical='center' width="6/7"> 
                <Heading color="white" size="20"> {displayName} </Heading>
                <Text color="white" size="14">@{username}</Text>
              </Column>
            </Columns> : "" }
          </Row>
          { Content(remaining_allowance, tip_allowance, user_rank, points) }
          <Row height="1/7" alignVertical='bottom'> <Text size="12" color="white" align='right'>frame design by @dangs.eth</Text> </Row>
        </Rows>
      </Box>
    ),
    intents: [
      <Button value="apples">Check</Button>,
      <Button.Link href={uriShare}>Share</Button.Link>,
    ],
  })
})

app.frame('/:fid/:secret', async (c) => {

  const { req } = c

  const regex = /\/([0-9]*)\/dangs[0-9a-zA-Z]*/gm;
  const fid = [...req.url.matchAll(regex)][0][1];
  
  var user = await fetch("https://client.warpcast.com/v2/user-by-fid?fid="+fid ,{ method:"GET" });
  var { result } = JSON.parse(await user.text()) || {};
  var { displayName, username, pfp } = result.user || {};
  var { url } = pfp || {}

  var degenBalance = await fetch("https://www.degentip.me/api/get_allowance?fid="+fid ,{ method:"GET" });
  var { allowance } = JSON.parse(await degenBalance.text()) || {};
  var { remaining_allowance, tip_allowance, user_rank, wallet_addresses } = allowance || {};

  if (typeof wallet_addresses != "undefined") {
    var rankBalance = await fetch("https://api.degen.tips/airdrop2/current/points?wallet="+wallet_addresses[0] ,{ method:"GET" });
    var { points } = JSON.parse(await rankBalance.text())[0] || {};
  } else {
    points = "0";
  }

  const ids = MakeID(7);
  const uriShare = encodeURI(`https://warpcast.com/~/compose?text=Check your $DEGEN Stats. Frame by @dangs.eth &embeds[]=${SITE_URL}api/${fid}/dangs${ids}`);

  return c.res({
    imageOptions: {
      height: 426,
      width: 816,
    },
    image: (
      <Box height="100%" width="100%" backgroundSize="816px 426px" backgroundRepeat='no-repeat' backgroundImage={`url("${SITE_URL}/bg.png")`}> 

        <Rows paddingTop="12" paddingRight="12" paddingLeft="12" paddingBottom="0" gap="8" grow>
          <Row height="2/7" >
            { typeof displayName != "undefined" ? 
            <Columns gap="8" grow> 
              <Column width="1/7"> 
                <Image width="72" height="100%"borderRadius="192" objectFit='cover' src={url} />
              </Column>
              <Column alignVertical='center' width="6/7"> 
                <Heading color="white" size="20"> {displayName} </Heading>
                <Text color="white" size="14">@{username}</Text>
              </Column>
            </Columns> : "" }
          </Row>
          { Content(remaining_allowance, tip_allowance, user_rank, points) }
          <Row height="1/7" alignVertical='bottom'> <Text size="12" color="white" align='right'>frame design by @dangs.eth</Text> </Row>
        </Rows>
      </Box>
    ),
    intents: [
      <Button action="/" value='/'>Check</Button>,
      <Button.Link href={uriShare}>Share</Button.Link>
    ],
  })
})
// @ts-ignore
const isEdgeFunction = typeof EdgeFunction !== 'undefined'
const isProduction = isEdgeFunction || import.meta.env?.MODE !== 'development'
devtools(app, isProduction ? { assetsPath: '/.frog' } : { serveStatic })

export const GET = handle(app)
export const POST = handle(app)
