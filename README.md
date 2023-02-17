# task-scheduler

GPT-3 powered task scheduler. The project is still a proof of concept only.

## Supported tasks

- Turn lamp on/off
- Turn TV on/off
- Change lamp color
- Make a tweet
- Add something to the calendar

## API request and response format

### Request:

```json
{
  "message": "change the lamp color to red"
}
```

### Response:

```json
{
  "message": "ok, I will change the lamp color to red"
  "tasks": [
    {
      "name": "change_lamp_color",
      "parameters": ["red"],
      "when": "now"
    }
  ]
}
```

## Example tasks

- Turn on the lights
- Turn off the Tv in 30 minutes
- When I say that I'm going to sleep, turn everything off
- Add to my calendar that I have to study tomorrow morning
- Make a tweet saying that the project is looking cool
