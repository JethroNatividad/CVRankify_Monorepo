def tz_score(a_hours: float, b_hours: float) -> float:
    # convert to 0..24 circle
    a = (a_hours + 24) % 24
    b = (b_hours + 24) % 24
    d = abs(a - b)
    diff = min(d, 24 - d)  # minimal circular distance, in hours
    score = (1 - diff / 12) * 100  # 100 = same zone, 0 = 12h apart
    return max(0.0, min(100.0, score)), diff

def parse_timezone(tz_string):
    """
    Converts 'GMT+5:30' or 'UTC-4' into a float offset like 5.5 or -4.0
    """
    if "GMT" in tz_string:
        tz = tz_string.split("GMT")[-1]
    elif "UTC" in tz_string:
        tz = tz_string.split("UTC")[-1]
    else:
        return None  # Unknown format

    # Example tz: +5:30, -4, +8
    sign = 1
    if tz.startswith("-"):
        sign = -1
        tz = tz[1:]
    elif tz.startswith("+"):
        tz = tz[1:]

    # Split hour/min if needed
    if ":" in tz:
        hours, mins = tz.split(":")
        offset = sign * (float(hours) + float(mins) / 60)
    else:
        offset = sign * float(tz)

    return offset