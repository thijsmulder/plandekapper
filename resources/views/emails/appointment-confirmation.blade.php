<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bevestig je afspraak</title>
    <style>
        @font-face {
            font-family: 'Inter';
            src: url('https://fonts.bunny.net/css?family=inter:400,500,600&amp;display=swap') format('truetype');
            font-weight: 400;
            font-style: normal;
        }
        body {
            font-family: 'Inter', Arial, sans-serif;
            background-color: #f9fafb;
            margin: 0;
            padding: 0;
            font-size: 14px;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 6px;
            border: 1px solid #e5e7eb;
        }
        h1 {
            color: #1D293DFF;
            font-size: 20px;
            font-weight: 500;
            margin-bottom: 16px;
        }
        p {
            color: #6b7280;
            line-height: 1.5;
            margin-bottom: 8px;
            font-weight: 400;
            margin-top: 10px;
        }
        strong {
            font-weight: bold;
        }
        .logo-container {
            display: flex;
            width: 100%;
            gap: 8px;
            align-items: center;
        }
        .logo-text {
            font-size: 18px;
            color: #2563eb;
            font-weight: 500;
        }
        ul {
            padding-left: 16px;
            margin: 12px 0;
        }
        ul li {
            color: #6b7280;
            font-weight: 400;
            margin-bottom: 6px;
        }
        a.button {
            background: #2563eb;
            color: white !important;
            border-radius: 5px;
            padding: 10px 20px;
            text-decoration: none;
            display: inline-block;
            margin-top: 12px;
            margin-bottom: 12px;
            font-weight: 500;
        }
    </style>
</head>
<body>

<div class="container">
    <p>Beste {{ $client->name }},</p>

    <p>Je hebt een afspraak ingepland bij {{ $company }}. Klik op onderstaande knop om deze definitief te maken:</p>

    <ul>
        <li><strong>Behandeling:</strong> {{ $appointment->treatment->name }}</li>
        <li><strong>Medewerker:</strong> {{ $appointment->employee->first_name }} {{ $appointment->employee->last_name }}</li>
        <li><strong>Datum en tijd:</strong> {{ $appointment->start_time->format('d-m-Y H:i') }}</li>
    </ul>

    <p>
        <a href="{{ route('booking.confirm', [$appointment->confirmation_token]) }}" class="button">
            Bevestig afspraak
        </a>
    </p>

    <p>Heb je geen afspraak gemaakt? Dan kun je deze e-mail negeren.</p>

    <p style="margin-top: 15px;">Met vriendelijke groet,<br/>Plandekapper</p>

    <div class="logo-container">
        <svg width="22" height="22" viewBox="0 0 1080 1080" xmlns="http://www.w3.org/2000/svg">
            <g id="Group">
                <path id="M-copy" fill="#3399ff" fill-rule="evenodd" stroke="none" d="M 380.221252 700.19873 L 380.221252 381.057495 L 467.701385 381.057495 L 539.819153 495.036499 L 611.936951 381.057495 L 699.417053 381.057495 L 699.417053 700.19873 L 620.471619 700.19873 L 620.471619 511.449463 L 540.245911 636.370483 L 459.166748 511.449463 L 459.166748 700.19873 Z"/>
                <!-- De rest van het logo mag hier eventueel blijven staan zoals in je voorbeeld -->
            </g>
        </svg>
        <p class="logo-text">Plandekapper</p>
    </div>

</div>

</body>
</html>
